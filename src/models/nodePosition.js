const db = require("../db")
const Experiment = require("./experiment")
const Node = require("./node")
const Point = require("./point")


const NodePosition = db.define("node_position")

NodePosition.belongsTo(Experiment)
NodePosition.belongsTo(Node, { as: "localizedNode", onDelete: "cascade" })
NodePosition.belongsTo(Point, { onDelete: "cascade" })

module.exports = NodePosition
