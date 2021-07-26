import { Sequelize, DataTypes } from "sequelize"
import db from "./index"

const PerpMarketStats = db.sequelize.define(
  "perp_market_stats",
  {
    symbol: { type: DataTypes.STRING, allowNull: false },
    totalDeposits: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.getDataValue("totalDeposits")
        return value ? parseFloat(value) : null
      },
    },
    totalBorrows: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.getDataValue("totalBorrows")
        return value ? parseFloat(value) : null
      },
    },
    depositRate: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.getDataValue("depositRate")
        return value === null ? null : parseFloat(value)
      },
    },
    borrowRate: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.getDataValue("borrowRate")
        return value === null ? null : parseFloat(value)
      },
    },
    mangoGroup: DataTypes.STRING,
    publicKey: DataTypes.STRING,
    utilization: DataTypes.DECIMAL,
    time: DataTypes.DATE,
  },
  {
    timestamps: false,
  }
)

PerpMarketStats.removeAttribute("id")

export default PerpMarketStats
