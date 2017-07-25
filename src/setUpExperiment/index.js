const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")

exports.setUpPoints = async function setUpPoints(points) {
  await Point.bulkCreate(points)
}

exports.setUpNodePositions = async function setUpNodePositions(nodePositions) {
  await NodePosition.bulkCreate(nodePositions)
}
