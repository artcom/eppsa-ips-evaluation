const Sequelize = require("sequelize")
const db = require("../db")

const Point = db.define("point", {
  pointId: { type: Sequelize.INTEGER, unique: true },
  trueCoordinateX: { type: Sequelize.FLOAT, allowNull: false },
  trueCoordinateY: { type: Sequelize.FLOAT, allowNull: false },
  trueCoordinateZ: { type: Sequelize.FLOAT, allowNull: false },
  trueRoomLabel: { type: Sequelize.STRING, allowNull: false },
})

module.exports = Point
