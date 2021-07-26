import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import { Op, QueryTypes } from "sequelize"
import PerpMarketStats from "../models/perp_market_stats"
import { sequelize } from "../models"

const app = express()

app.use(express.json(), cors())

app.get("/", async (req, res) => {
  try {
    const mangoGroup = (req.query.mangoGroup as string) || ""
    let stats
    if (mangoGroup === "BTC_ETH_USDT" || mangoGroup === "BTC_ETH_SOL_SRM_USDC") {
      stats = await sequelize.query(
        `SELECT time_bucket('60 minutes', time) AS "hourly", 
          "symbol", 
          avg("totalDeposits")::float AS "totalDeposits", 
          avg("totalBorrows")::float AS "totalBorrows", 
          avg("utilization")::float AS "utilization", 
          avg("depositInterest")::float AS "depositInterest", 
          avg("borrowInterest")::float AS "borrowInterest", 
          min("time") AS "time"
        FROM mainnet_stats
        WHERE time > current_date - interval '90' day AND "mangoGroup" = :mangoGroup
        GROUP BY "hourly", "symbol"
        ORDER BY "hourly" ASC;`,
        {
          replacements: { mangoGroup },
          type: QueryTypes.SELECT,
        }
      )
    } else {
      stats = await PerpMarketStats.findAll({
        order: [["time", "ASC"]],
        where: { mangoGroup: { [Op.or]: [null, mangoGroup] } },
      })
    }
    res.send(stats)
  } catch (e) {
    console.log("Error inserting data", e)
  }
})

app.get("/current", async (req, res) => {
  try {
    const stats = await PerpMarketStats.findAll({ limit: 3, order: [["time", "DESC"]] })
    res.send(stats)
  } catch (e) {
    console.log("Error inserting data", e)
  }
})

app.listen(process.env.PORT, () => console.log(`Server listening at http://localhost:${process.env.PORT}`))
