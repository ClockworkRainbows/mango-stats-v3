import { Connection, PublicKey } from "@solana/web3.js"
import {
  Config,
  getMultipleAccounts,
  GroupConfig,
  I80F48,
  IDS,
  MangoClient,
  PerpMarket,
  PerpMarketLayout,
} from "@blockworks-foundation/mango-client"
import PerpMarketStats from "../models/perp_market_stats"
import SpotMarketStats from "../models/spot_market_stats"

const CLUSTER_URLS = [
  {
    name: "mainnet-beta",
    url: "https://mango.rpcpool.com/",
    websocket: "https://mango.rpcpool.com/",
  },
  {
    name: "devnet",
    url: "https://mango.devnet.rpcpool.com",
    websocket: "https://api.devnet.solana.com",
  },
]

export type CLUSTER_TYPE = "devnet" | "mainnet-beta"

const loadPerpMarkets = async (connection, groupConfig: GroupConfig) => {
  const perpMarketPks = groupConfig.perpMarkets.map((p) => p.publicKey)

  const allMarketAccountInfos = await getMultipleAccounts(connection, perpMarketPks)

  return groupConfig.perpMarkets.map((config, i) => {
    const decoded = PerpMarketLayout.decode(allMarketAccountInfos[i].accountInfo.data)

    return new PerpMarket(config.publicKey, config.baseDecimals, config.quoteDecimals, decoded)
  })
}

async function fetchAndPersistStats(cluster: CLUSTER_TYPE) {
  const clusterUrl = CLUSTER_URLS.find((c) => c.name === cluster)
  if (!clusterUrl) return
  const connection = new Connection(clusterUrl.url, "singleGossip")
  const config = new Config(IDS)

  const groupConfig = config.getGroup(cluster, "mango_test_v3.8")
  console.log("1")

  const client = new MangoClient(connection, groupConfig.mangoProgramId)
  console.log("2")

  const mangoGroup = await client.getMangoGroup(groupConfig.publicKey)
  console.log("3")

  await mangoGroup.loadRootBanks(connection)
  console.log("4")

  const spotMarketStats = groupConfig.spotMarkets.map((spotMarket, index) => {
    const totalDeposits = mangoGroup.getUiTotalDeposit(index)
    const totalBorrows = mangoGroup.getUiTotalBorrow(index)
    return {
      time: new Date(),
      name: groupConfig.spotMarkets[index].name,
      publicKey: spotMarket.publicKey.toString(),
      mangoGroup: groupConfig.name,
      totalDeposits: totalDeposits.toNumber(),
      totalBorrows: totalBorrows.toNumber(),
      depositRate: mangoGroup.getDepositRate(index).toNumber(),
      borrowRate: mangoGroup.getBorrowRate(index).toNumber(),
      utilization: totalDeposits.gt(I80F48.fromNumber(0)) ? totalBorrows.div(totalDeposits).toNumber() : 0,
      baseOraclePrice: 0,
    }
  })
  try {
    await SpotMarketStats.bulkCreate(spotMarketStats)
    console.log("spot stats inserted")
  } catch (err) {
    console.log("failed to insert spot stats", `${err}`)
  }

  const perpMarkets = await loadPerpMarkets(connection, groupConfig)
  console.log("6")

  const perpMarketStats = perpMarkets.map((perpMarket, index) => {
    return {
      time: new Date(),
      name: groupConfig.perpMarkets[index].name,
      publicKey: perpMarket.publicKey.toString(),
      mangoGroup: groupConfig.name,
      longFunding: perpMarket.longFunding.toNumber(),
      shortFunding: perpMarket.shortFunding.toNumber(),
      openInterest: perpMarket.openInterest.toNumber(),
      baseOraclePrice: 0,
    }
  })

  try {
    await PerpMarketStats.bulkCreate(perpMarketStats)
    console.log("perp stats inserted")
  } catch (err) {
    console.log("failed to insert spot stats", `${err}`)
  }
}

export default fetchAndPersistStats
