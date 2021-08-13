import { Sequelize, DataTypes } from "sequelize"
import db from "./index"

const PerpMarketStats = db.sequelize.define(
  "spot_market_stats",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    totalDeposits: DataTypes.DECIMAL,
    totalBorrows: DataTypes.DECIMAL,
    depositRate: DataTypes.DECIMAL,
    borrowRate: DataTypes.DECIMAL,
    baseOraclePrice: DataTypes.DECIMAL,
    depositIndex: DataTypes.DECIMAL,
    borrowIndex: DataTypes.DECIMAL,
    mangoGroup: DataTypes.STRING,
    utilization: DataTypes.DECIMAL,
    time: DataTypes.DATE,
  },
  {
    timestamps: false,
  }
)

PerpMarketStats.removeAttribute("id")

export default PerpMarketStats
