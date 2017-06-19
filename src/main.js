const data = require("../data/point-measurements.json")
const errors = require("./computations/errors")
const getDataForAllTags = require("./fetchData/getQuuppaData")
const { initializePoints } = require("./initializeDb")
const Point = require("./models/point")
const primaryMetrics = require("./computations/primaryMetrics")


initializePoints()
  .then(() =>
    Point
      .findAll()
      .then(points => console.log(`points: ${points.map(point => point.pointId)}`))
  )
  .catch(error => console.error(error))


getDataForAllTags()
  .then(response => console.log(response.data))
  .catch(error => console.error(error))

function processData(data) {
  const processedData = errors(data)
  return primaryMetrics(processedData, data)
}

console.log(processData(data))
