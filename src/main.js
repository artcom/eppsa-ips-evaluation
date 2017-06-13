const data = require("../data/point-measurements.json")
const errors = require("./computations/errors")
const primaryMetrics = require("./computations/primaryMetrics")

function processData(data) {
  const processedData = errors(data)
  return primaryMetrics(processedData, data)
}

console.log(processData(data))
