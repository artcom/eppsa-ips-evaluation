const db = require("./db")
const nodePositions = require("../data/nodePositions.json")
const points = require("../data/points.json")
const NodePosition = require("./models/nodePosition")
const Point = require("./models/point")


exports.initializePoints = async function initializePoints() {
  await db.sync({ force: true }).then(() => {
    createPoints(points)
    createNodePositions(nodePositions)
  })
}

function createPoints(points) {
  for (const point of points) {
    Point.create(point)
  }
}

function createNodePositions(nodePositions) {
  for (const nodePosition of nodePositions) {
    NodePosition.create(nodePosition)
  }
}
