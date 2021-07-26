"use strict"
const Sequelize = require("sequelize")
const env = process.env.NODE_ENV || "development"
const config = require(__dirname + "/../config/config.js")[env]
const db = {}

const sequelize = new Sequelize(process.env[config.use_env_variable], config)

sequelize
  .authenticate()
  .then(function (err) {
    console.log("Connection has been established successfully.")
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err)
  })

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
