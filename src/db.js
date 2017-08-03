const Sequelize = require("sequelize")
const config = require("./constants")


if (process.env.NODE_ENV === "test") {
  module.exports = instanciateSequelize(config.testDatabase)
} else {
  module.exports = instanciateSequelize(config.database)
}

function instanciateSequelize({ database, username, password, host }) {
  return new Sequelize(database, username, password, {
    host,
    dialect: "postgres",

    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
  })
}
