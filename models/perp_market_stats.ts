import { Sequelize, DataTypes } from "sequelize"
import db from "./index"

const PerpMarketStats = db.sequelize.define(
  "perp_market_stats",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    longFunding: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.getDataValue("longFunding")
        return value ? parseFloat(value) : null
      },
    },
    shortFunding: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.getDataValue("shortFunding")
        return value ? parseFloat(value) : null
      },
    },
    openInterest: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.getDataValue("openInterest")
        return value === null ? null : parseFloat(value)
      },
    },
    baseOraclePrice: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.getDataValue("baseOraclePrice")
        return value === null ? null : parseFloat(value)
      },
    },
    mangoGroup: DataTypes.STRING,
    time: DataTypes.DATE,
  },
  {
    timestamps: false,
  }
)

PerpMarketStats.removeAttribute("id")

export default PerpMarketStats
