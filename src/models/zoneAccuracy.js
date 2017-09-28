const Sequelize = require("sequelize")
const db = require("../db")
const PositionData = require("./positionData")
const ZoneSet = require("./zoneSet")


const ZoneAccuracy = db.define("zone_accuracy", {
  accuracy: { type: Sequelize.BOOLEAN, allowNull: false }
})

ZoneAccuracy.belongsTo(PositionData)
ZoneAccuracy.belongsTo(ZoneSet)

module.exports = ZoneAccuracy
