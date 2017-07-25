const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")

exports.setUpPoints = async function setUpPoints(points) {
  return await Point.bulkCreate(points)
}

exports.setUpNodePositions = async function setUpNodePositions(nodePositions) {
  return await NodePosition.bulkCreate(nodePositions)
}
