"use strict"
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "perp_market_stats",
      {
        name: {
          type: Sequelize.STRING,
        },
        mangoGroup: {
          type: Sequelize.STRING,
        },
        longFunding: {
          type: Sequelize.DECIMAL,
        },
        shortFunding: {
          type: Sequelize.DECIMAL,
        },
        openInterest: {
          type: Sequelize.DECIMAL,
        },
        baseOraclePrice: {
          type: Sequelize.DECIMAL,
        },
        feesAccrued: {
          type: Sequelize.DECIMAL,
        },
        mngoLeft: {
          type: Sequelize.DECIMAL,
        },
        mngoPerPeriod: {
          type: Sequelize.DECIMAL,
        },
        rate: {
          type: Sequelize.DECIMAL,
        },
        maxDepthBps: {
          type: Sequelize.DECIMAL,
        },
        periodStart: {
          type: Sequelize.DATE,
        },
        time: {
          type: Sequelize.DATE,
        },
      },
      { timestamps: false }
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("perp_market_stats")
  },
}
