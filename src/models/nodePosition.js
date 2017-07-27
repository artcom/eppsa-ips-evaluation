const Sequelize = require("sequelize")
const db = require("../db")
const Experiment = require("./experiment")


const NodePosition = db.define("node_position", {
  localizedNodeId: { type: Sequelize.STRING, allowNull: false },
  pointName: { type: Sequelize.STRING, allowNull: false },
})

NodePosition.belongsTo(Experiment)

module.exports = NodePosition