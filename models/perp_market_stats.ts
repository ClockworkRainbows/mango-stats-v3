import { Sequelize, DataTypes } from "sequelize"
import db from "./index"

const PerpMarketStats = db.sequelize.define(
  "perp_market_stats",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    mangoGroup: DataTypes.STRING,
    longFunding: DataTypes.DECIMAL,
    shortFunding: DataTypes.DECIMAL,
    openInterest: DataTypes.DECIMAL,
    baseOraclePrice: DataTypes.DECIMAL,
    feesAccrued: DataTypes.DECIMAL,
    mngoLeft: DataTypes.DECIMAL,
    mngoPerPeriod: DataTypes.DECIMAL,
    rate: DataTypes.DECIMAL,
    maxDepthBps: DataTypes.DECIMAL,
    periodStart: DataTypes.DECIMAL,
    time: DataTypes.DATE,
  },
  {
    timestamps: false,
  }
)

PerpMarketStats.removeAttribute("id")

export default PerpMarketStats
