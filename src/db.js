const Sequelize = require("sequelize")
const config = require("../.config.json")


const { database, username, password, host } = config.environment === "test"
  ? config.testDatabase
  : config.database

module.exports = new Sequelize(database, username, password, {
  host,
  dialect: "postgres",

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
})
