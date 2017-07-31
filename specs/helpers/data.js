const { concat, includes, keys, omit, pick, sortBy } = require("lodash")
const { expect } = require("chai")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const positionData = require("../testData/positionData.json")


const positionDataNoErrors = function positionDataNoErrors(positionData) {
  const errorKeys = ["localizationError2d", "localizationError3d", "roomAccuracy"]

  return positionData
    .map(position =>
      pick(position, keys(positionData[0]).filter(key => !includes(errorKeys, key)))
    )
}

const checkPositionData = function checkPositionData(queryResults) {
  const errorKeys = ["localizationError2d", "localizationError3d", "roomAccuracy"]
  const storedPositionData = queryResults
    .map(queryResult =>
      pick(queryResult, keys(positionData[0])
        .filter(key => !includes(errorKeys, key)))
    )
  const storedPositionErrors = sortBy(
    queryResults
      .map(queryResult => pick(queryResult, concat(errorKeys, "pointName"))),
    ["pointName"]
  )
  const positionErrors = sortBy(positionData
    .map(position => pick(position, concat(errorKeys, "pointName"))), ["pointName"])

  expect(sortBy(storedPositionData, ["pointName"]))
    .to.deep.equal(sortBy(positionDataNoErrors(positionData), ["PointName"]))

  for (const storedPosition of storedPositionErrors) {
    const index = storedPositionErrors.indexOf(storedPosition)
    for (const key of errorKeys) {
      expect(storedPosition[key])
        .to.be.closeTo(positionErrors[index][key], 0.00000000000001)
    }
  }
}

const checkPrimaryMetrics = function checkPrimaryMetrics(
  experimentMetrics,
  experimentName = "test-experiment",
  withLatencyAndPowerConsumption = true
) {
  expect(experimentMetrics[0].experimentName).to.equal(experimentName)
  expect(experimentMetrics[0].experiment.name).to.equal(experimentName)
  const keysToOmit = withLatencyAndPowerConsumption
    ? ["experimentName"]
    : [
      "experimentName",
      "latencyAverage",
      "latencyMin",
      "latencyMax",
      "latencyVariance",
      "latencyMedian",
      "latencyRMS",
      "latencyPercentile75",
      "latencyPercentile90",
      "powerConsumptionAverage",
      "powerConsumptionMin",
      "powerConsumptionMax",
      "powerConsumptionVariance",
      "powerConsumptionMedian",
      "powerConsumptionRMS",
      "powerConsumptionPercentile75",
      "powerConsumptionPercentile90"
    ]
  for (const key of keys(omit(experimentPrimaryMetrics, keysToOmit))) {
    expect(experimentMetrics[0][key])
      .to.be.closeTo(experimentPrimaryMetrics[key], 0.0000000000001)
  }
}

exports.positionDataNoErrors = positionDataNoErrors
exports.checkPositionData = checkPositionData
exports.checkPrimaryMetrics = checkPrimaryMetrics
