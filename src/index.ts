import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import { QueryTypes } from "sequelize"
import { sequelize } from "../models"
import { maxBy, minBy } from "lodash"

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
          avg("depositRate")::float AS "depositRate", 
          avg("borrowRate")::float AS "borrowRate", 
          avg("baseOraclePrice")::float AS "baseOraclePrice",
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

app.get("/spot/change/24", async (req, res) => {
  try {
    const market = req.query.market as string
    const mangoGroup = req.query.mangoGroup as string
    console.log("market, mangoGroup", market, mangoGroup)
    if (!market) {
      throw new Error("Missing market param")
    }
    if (!mangoGroup) {
      throw new Error("Missing mangoGroup param")
    }

    const stats = await sequelize.query(
      `SELECT "baseOraclePrice", 
          "time"
        FROM spot_market_stats
        WHERE time > current_date - INTERVAL '1 DAY' AND "mangoGroup" = :mangoGroup AND "name" = :market
        ORDER BY "time" DESC;`,
      {
        replacements: { mangoGroup, market },
        type: QueryTypes.SELECT,
      }
    )

    const latestStat = stats[0]
    const oldestStat = stats[stats.length - 1]
    const change = (latestStat.baseOraclePrice / oldestStat.baseOraclePrice - 1) * 100

    const high = maxBy(stats, "baseOraclePrice")
    const low = minBy(stats, "baseOraclePrice")

    res.send({ change, high, low, latest: latestStat })
  } catch (e) {
    console.log("Error inserting data", e)
  }
})

app.get("/perp/funding_rate", async (req, res) => {
  try {
    const market = req.query.market as string
    const mangoGroup = req.query.mangoGroup as string

    if (!market) {
      throw new Error("Missing mangoGroup param")
    }
    if (!mangoGroup) {
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
        WHERE time > NOW() - interval '1 hour' AND "name" = :market AND "mangoGroup" = :mangoGroup`,
      {
        replacements: { market, mangoGroup },
        type: QueryTypes.SELECT,
      }
    )

    res.send(stats)
  } catch (e) {
    console.log("Error inserting data", e)
  }
})

app.listen(process.env.PORT, () => console.log(`Server listening at http://localhost:${process.env.PORT}`))
