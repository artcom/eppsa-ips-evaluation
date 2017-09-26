const Sequelize = require("sequelize")
const db = require("../db")


const ZoneAccuracy = db.define("zone_accuracy", {
  accuracy: { type: Sequelize.BOOLEAN, allowNull: false }
})

module.exports = ZoneAccuracy
