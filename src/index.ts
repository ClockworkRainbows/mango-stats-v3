import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import { Op, QueryTypes } from "sequelize"
import PerpMarketStats from "../models/perp_market_stats"
import { sequelize } from "../models"

const app = express()

app.use(express.json(), cors())

app.get("/spot", async (req, res) => {
  try {
    const mangoGroup = req.query.mangoGroup as string
    if (!mangoGroup) {
      throw new Error("Missing mangoGroup param")
    }

    const stats = await sequelize.query(
      `SELECT time_bucket('60 minutes', time) AS "hourly", 
          "name", 
          avg("totalDeposits")::float AS "totalDeposits", 
          avg("totalBorrows")::float AS "totalBorrows", 
          avg("utilization")::float AS "utilization", 
          avg("depositInterest")::float AS "depositInterest", 
          avg("borrowInterest")::float AS "borrowInterest", 
          min("time") AS "time"
        FROM spot_market_stats
        WHERE time > current_date - interval '90' day AND "mangoGroup" = :mangoGroup
        GROUP BY "hourly", "name"
        ORDER BY "hourly" ASC;`,
      {
        replacements: { mangoGroup },
        type: QueryTypes.SELECT,
      }
    )

    res.send(stats)
  } catch (e) {
    console.log("Error inserting data", e)
  }
})

app.get("/perp/funding_rate", async (req, res) => {
  try {
    const market = req.query.market as string
    if (!market) {
      throw new Error("Missing mangoGroup param")
    }

    const stats = await sequelize.query(
      `SELECT 
          "longFunding", 
          "shortFunding", 
          "openInterest", 
          "baseOraclePrice",
          "time"
        FROM perp_market_stats
        WHERE time > NOW() - interval '1 hour' AND "name" = :market`,
      {
        replacements: { market },
        type: QueryTypes.SELECT,
      }
    )

    res.send(stats)
  } catch (e) {
    console.log("Error inserting data", e)
  }
})

app.listen(process.env.PORT, () => console.log(`Server listening at http://localhost:${process.env.PORT}`))
