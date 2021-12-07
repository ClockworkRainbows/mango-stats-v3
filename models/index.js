"use strict"

require("dotenv").config()
const Sequelize = require("sequelize")
const db = {}
var parse = require("pg-connection-string")
var readDBConfig = parse(process.env.TIMESCALEDB_URL_READ)
var writeDBConfig = parse(process.env.TIMESCALEDB_URL)

const sequelize = new Sequelize({
  username: writeDBConfig.user,
  password: writeDBConfig.password,
  database: writeDBConfig.database,
  port: parseInt(writeDBConfig.port),
  replication: {
    read: [{ host: readDBConfig.host }],
    write: { host: writeDBConfig.host },
  },
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
})

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
