"use strict"

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("SELECT create_hypertable('spot_market_stats', 'time');")
  },

  down: (queryInterface, Sequelize) => {},
}
