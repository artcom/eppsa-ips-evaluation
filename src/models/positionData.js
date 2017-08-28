const Sequelize = require("sequelize")
const db = require("../db")
const Experiment = require("./experiment")
const Node = require("./node")
const Point = require("./point")


const PositionData = db.define("position_data", {
  estCoordinateX: { type: Sequelize.FLOAT, allowNull: false },
  estCoordinateY: { type: Sequelize.FLOAT, allowNull: false },
  estCoordinateZ: { type: Sequelize.FLOAT, allowNull: false },
  estZoneLabel: { type: Sequelize.STRING, allowNull: false },
  latency: Sequelize.FLOAT,
  powerConsumption: Sequelize.FLOAT,
  localizationError2d: Sequelize.FLOAT,
  localizationError3d: Sequelize.FLOAT,
  zoneAccuracy: Sequelize.INTEGER
})

PositionData.belongsTo(Node, { as: "localizedNode" })
PositionData.belongsTo(Point)
PositionData.belongsTo(Experiment)

module.exports = PositionData
