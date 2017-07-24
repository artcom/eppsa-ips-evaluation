const Sequelize = require("sequelize")
const db = require("../db")
const Point = require("./point")


const PositionData = db.define("position_data", {
  localizedNodeId: { type: Sequelize.STRING, allowNull: false },
  localizedNodeName: { type: Sequelize.STRING, allowNull: false },
  estCoordinateX: { type: Sequelize.FLOAT, allowNull: false },
  estCoordinateY: { type: Sequelize.FLOAT, allowNull: false },
  estCoordinateZ: { type: Sequelize.FLOAT, allowNull: false },
  estRoomLabel: { type: Sequelize.STRING, allowNull: false },
  latency: Sequelize.FLOAT,
  powerConsumption: Sequelize.FLOAT
})

PositionData.belongsTo(Point)

module.exports = PositionData
