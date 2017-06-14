const db = require("./db")
const points = require("../data/points.json")
const Point = require("./models/point")


exports.initializePoints = async function initializePoints() {
  await db.sync({ force: true }).then(() =>
    createPoints(points)
  )
}

function createPoints(points) {
  for (const point of points) {
    console.log()
    Point.create(point)
  }
}
