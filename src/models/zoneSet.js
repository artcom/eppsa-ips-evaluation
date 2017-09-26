const Sequelize = require("sequelize")
const db = require("../db")
const Zone = require("./zone")


const ZoneSet = db.define("zone_set", {
  name: { type: Sequelize.STRING, allowNull: false, primaryKey: true }
})

ZoneSet.hasMany(Zone)

module.exports = ZoneSet
