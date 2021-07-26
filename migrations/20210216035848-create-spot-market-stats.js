"use strict"
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "spot_market_stats",
      {
        name: {
          type: Sequelize.STRING,
        },
        publicKey: {
          type: Sequelize.STRING,
        },
        mangoGroup: {
          type: Sequelize.STRING,
        },
        depositRate: {
          type: Sequelize.DECIMAL,
        },
        borrowRate: {
          type: Sequelize.DECIMAL,
        },
        totalDeposits: {
          type: Sequelize.DECIMAL,
        },
        totalBorrows: {
          type: Sequelize.DECIMAL,
        },
        baseOraclePrice: {
          type: Sequelize.DECIMAL,
        },
        time: {
          type: Sequelize.DATE,
        },
        utilization: {
          type: Sequelize.DECIMAL,
        },
      },
      { timestamps: false }
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("spot_market_stats")
  },
}
