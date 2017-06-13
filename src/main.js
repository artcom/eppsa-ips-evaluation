const data = require("../data/point-measurements.json")
const errors = require("./computations/errors")

function processData(data) {
  return errors(data)
}

console.log(processData(data))
