const Sequelize = require("sequelize")
const db = require("../db")


const NodePosition = db.define("node_position", {
  localizedNodeId: { type: Sequelize.STRING, allowNull: false },
  pointId: { type: Sequelize.INTEGER, allowNull: false }
})

module.exports = NodePosition
