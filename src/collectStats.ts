import { Connection } from "@solana/web3.js"
import {
  Config,
  Cluster,
  getMultipleAccounts,
  GroupConfig,
  I80F48,
  IDS,
  MangoClient,
  PerpMarket,
  PerpMarketLayout,
  getMarketIndexBySymbol,
  QUOTE_INDEX,
} from "@blockworks-foundation/mango-client"
import PerpMarketStats from "../models/perp_market_stats"
import SpotMarketStats from "../models/spot_market_stats"
import notify from "./notify"

const CLUSTER_URLS = [
  {
    name: "mainnet",
    url: process.env.ENDPOINT || "https://mango.rpcpool.com/",
    websocket: "https://mango.rpcpool.com/",
  },
  {
    name: "devnet",
    url: "https://mango.devnet.rpcpool.com",
    websocket: "https://api.devnet.solana.com",
  },
]

const cluster = (process.env.CLUSTER || "devnet") as Cluster
const groupName = (process.env.GROUP || "devnet.1") as string
const SECONDS = 1000
const PERP_INTERVAL = 10 * SECONDS
const SPOT_INTERVAL = 20 * SECONDS
const clusterUrl = CLUSTER_URLS.find((c) => c.name === cluster)
const connection = new Connection(clusterUrl.url, "singleGossip")
const config = new Config(IDS)
const groupConfig = config.getGroup(cluster, groupName)
const client = new MangoClient(connection, groupConfig.mangoProgramId)

const loadPerpMarkets = async (connection, groupConfig: GroupConfig) => {
  const perpMarketPks = groupConfig.perpMarkets.map((p) => p.publicKey)

  const allMarketAccountInfos = await getMultipleAccounts(connection, perpMarketPks)

  return groupConfig.perpMarkets.map((config, i) => {
    const decoded = PerpMarketLayout.decode(allMarketAccountInfos[i].accountInfo.data)

    return new PerpMarket(config.publicKey, config.baseDecimals, config.quoteDecimals, decoded)
  })
}

async function fetchSpotStats() {
  try {
    const mangoGroup = await client.getMangoGroup(groupConfig.publicKey)
    const mangoCache = await mangoGroup.loadCache(connection)
    // TODO: reduce calls in loadRootBanks
    await mangoGroup.loadRootBanks(connection)

    const spotMarketStats = groupConfig.tokens.map((token) => {
      let tokenIndex = getMarketIndexBySymbol(groupConfig, token.symbol)
      tokenIndex = tokenIndex === -1 ? QUOTE_INDEX : tokenIndex
      const totalDeposits = mangoGroup.getUiTotalDeposit(tokenIndex)
      const totalBorrows = mangoGroup.getUiTotalBorrow(tokenIndex)
      return {
        time: new Date(),
        name: token.symbol,
        mangoGroup: groupConfig.name,
        totalDeposits: totalDeposits.toNumber(),
        totalBorrows: totalBorrows.toNumber(),
        depositRate: mangoGroup.getDepositRate(tokenIndex).toNumber(),
        borrowRate: mangoGroup.getBorrowRate(tokenIndex).toNumber(),
        depositIndex: mangoGroup.rootBankAccounts[tokenIndex].depositIndex.toNumber(),
        borrowIndex: mangoGroup.rootBankAccounts[tokenIndex].borrowIndex.toNumber(),
        utilization: totalDeposits.gt(I80F48.fromNumber(0)) ? totalBorrows.div(totalDeposits).toNumber() : 0,
        baseOraclePrice: mangoGroup.getPrice(tokenIndex, mangoCache).toNumber(),
      }
    })

    await SpotMarketStats.bulkCreate(spotMarketStats)
    console.log("spot stats inserted")
  } catch (err) {
    notify(`mango-stats-v3 perp stats ERROR: ${err}`)
    console.log("failed to insert spot stats", `${err}`)
  } finally {
    setTimeout(fetchSpotStats, SPOT_INTERVAL)
  }
}

async function fetchPerpStats() {
  try {
    const mangoGroup = await client.getMangoGroup(groupConfig.publicKey)
    const mangoCache = await mangoGroup.loadCache(connection)
    const perpMarkets = await loadPerpMarkets(connection, groupConfig)

    const perpMarketStats = perpMarkets.map((perpMarket, index) => {
      return {
        time: new Date(),
        name: groupConfig.perpMarkets[index].name,
        mangoGroup: groupConfig.name,
        longFunding: perpMarket.longFunding.toNumber(),
        shortFunding: perpMarket.shortFunding.toNumber(),
        openInterest: perpMarket.openInterest.toNumber(),
        baseOraclePrice: mangoCache.priceCache[groupConfig.perpMarkets[index].marketIndex].price.toNumber(),
        feesAccrued: perpMarket.feesAccrued.toNumber(),
        mngoLeft: perpMarket.liquidityMiningInfo.mngoLeft.toNumber(),
        mngoPerPeriod: perpMarket.liquidityMiningInfo.mngoPerPeriod.toNumber(),
        rate: perpMarket.liquidityMiningInfo.rate.toNumber(),
        maxDepthBps: perpMarket.liquidityMiningInfo.maxDepthBps.toNumber(),
        periodStart: new Date(perpMarket.liquidityMiningInfo.periodStart.toNumber() * 1000).toISOString(),
      }
    })

    await PerpMarketStats.bulkCreate(perpMarketStats)
    console.log("perp stats inserted")
  } catch (err) {
    console.log("failed to insert perp stats", `${err}`)
    notify(`mango-stats-v3 spot stats ERROR: ${err}`)
  } finally {
    setTimeout(fetchPerpStats, PERP_INTERVAL)
  }
}

async function main() {
  notify("mango-stats-v3 restarting")
  fetchPerpStats()
  fetchSpotStats()
}

main()
