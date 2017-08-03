const Sequelize = require("sequelize")
const db = require("../db")
const Experiment = require("./experiment")
const Point = require("./point")


const NodePosition = db.define("node_position", {
  localizedNodeId: { type: Sequelize.STRING, allowNull: false },
})

NodePosition.belongsTo(Experiment)
NodePosition.belongsTo(Point)

module.exports = NodePosition
