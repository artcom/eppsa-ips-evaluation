const Sequelize = require("sequelize")
const db = require("../db")


module.exports = db.define("position_data", {
  localizedNodeId: { type: Sequelize.STRING, allowNull: false },
  estCoordinateX: { type: Sequelize.FLOAT, allowNull: false },
  estCoordinateY: { type: Sequelize.FLOAT, allowNull: false },
  estCoordinateZ: { type: Sequelize.FLOAT, allowNull: false },
  estRoomLabel: { type: Sequelize.STRING, allowNull: false },
  latency: Sequelize.FLOAT,
  powerConsumption: Sequelize.FLOAT
})
