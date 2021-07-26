import { Connection, PublicKey } from "@solana/web3.js"
import { IDS, MangoClient } from "@blockworks-foundation/mango-client"
import PerpMarketStats from "../models/perp_market_stats"

async function fetchAndPersistStats() {
  // const clusterUrls = IDS.cluster_urls[cluster]
  // if (!clusterUrls) return
  // const client = new MangoClient()
  // const connection = new Connection(IDS.cluster_urls[cluster], "singleGossip")
  // const stats: any[][] = await Promise.all(
  //   MANGO_GROUPS.map(async (mangoGroupName) => {
  //     const assets = IDS[cluster].mango_groups?.[mangoGroupName]?.symbols
  //     const mangoGroupId = IDS[cluster].mango_groups?.[mangoGroupName]?.mango_group_pk
  //     const mangoGroupPk = new PublicKey(mangoGroupId)
  //     const mangoGroup = await client.getMangoGroup(connection, mangoGroupPk)
  //     const mangoGroupStats = Object.keys(assets).map((symbol, index) => {
  //       const totalDeposits = mangoGroup.getUiTotalDeposit(index)
  //       const totalBorrows = mangoGroup.getUiTotalBorrow(index)
  //       return {
  //         time: new Date(),
  //         symbol,
  //         totalDeposits,
  //         totalBorrows,
  //         depositInterest: mangoGroup.getDepositRate(index),
  //         borrowInterest: mangoGroup.getBorrowRate(index),
  //         utilization: totalDeposits > 0.0 ? totalBorrows / totalDeposits : 0.0,
  //         mangoGroup: mangoGroupName,
  //       }
  //     })
  //     return mangoGroupStats
  //   })
  // )
  // const tableName = cluster === "devnet" ? DevnetStats : MainnetStats
  // try {
  //   console.log("stats", stats.flat())
  //   await tableName.bulkCreate(stats.flat())
  //   console.log("stats inserted")
  // } catch (err) {
  //   console.log("failed to insert stats", err)
  // }
}

export default fetchAndPersistStats
