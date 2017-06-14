const data = require("../data/point-measurements.json")
const errors = require("./computations/errors")
const getDataForAllTags = require("./fetchData/getQuuppaData")
const primaryMetrics = require("./computations/primaryMetrics")

function processData(data) {
  const processedData = errors(data)
  return primaryMetrics(processedData, data)
}

console.log(processData(data))

getDataForAllTags()
  .then(response => console.log(response.data))
  .catch(error => console.error(error))
