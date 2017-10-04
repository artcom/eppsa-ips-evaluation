const Sequelize = require("sequelize")
const db = require("../db")
const Experiment = require("./experiment")
const ZoneSet = require("./zoneSet")


const ExperimentZoneAccuracy = db.define("experiment_zone_accuracy", {
  accuracyAverage: { type: Sequelize.FLOAT, allowNull: false }
})

ExperimentZoneAccuracy.belongsTo(Experiment)
ExperimentZoneAccuracy.belongsTo(ZoneSet)

module.exports = ExperimentZoneAccuracy
