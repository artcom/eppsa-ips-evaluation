const Sequelize = require("sequelize")
const db = require("../db")
const PositionData = require("./positionData")

const Point = db.define("point", {
  pointId: { type: Sequelize.INTEGER },
  trueCoordinateX: { type: Sequelize.FLOAT, allowNull: false },
  trueCoordinateY: { type: Sequelize.FLOAT, allowNull: false },
  trueCoordinateZ: { type: Sequelize.FLOAT, allowNull: false },
  trueRoomLabel: { type: Sequelize.STRING, allowNull: false },
})

Point.belongsTo(PositionData)

module.exports = Point
