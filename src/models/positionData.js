const Sequelize = require("sequelize")
const db = require("../db")
const Experiment = require("./experiment")
const Point = require("./point")


const PositionData = db.define("position_data", {
  localizedNodeId: { type: Sequelize.STRING, allowNull: false },
  localizedNodeName: { type: Sequelize.STRING, allowNull: false },
  estCoordinateX: { type: Sequelize.FLOAT, allowNull: false },
  estCoordinateY: { type: Sequelize.FLOAT, allowNull: false },
  estCoordinateZ: { type: Sequelize.FLOAT, allowNull: false },
  estZoneLabel: { type: Sequelize.STRING, allowNull: false },
  latency: Sequelize.FLOAT,
  powerConsumption: Sequelize.FLOAT,
  localizationError2d: Sequelize.FLOAT,
  localizationError3d: Sequelize.FLOAT,
  roomAccuracy: Sequelize.INTEGER
})

PositionData.belongsTo(Point)
PositionData.belongsTo(Experiment)

module.exports = PositionData
