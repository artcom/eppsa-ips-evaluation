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

const positionDataSorted = function positionDataSorted(
  positionData,
  nonPositionData
) {
  return nonPositionData
    ? sortBy(positionDataNoErrors(positionData), ["pointName"])
    : sortBy(
      positionDataNoErrors(positionData)
        .map(positionDatum =>
          omit(positionDatum, ["experimentName", "latency", "powerConsumption"])
        )
      , ["pointName"]
    )
}

const checkPositionData = function checkPositionData(
  queryResults,
  nonPositionData = true,
  checkErrors = true
) {
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

  const expectedPositionData = positionDataSorted(positionData, nonPositionData)
  const sortedStoredPositionData = positionDataSorted(storedPositionData, nonPositionData)
  expect(sortedStoredPositionData)
    .to.deep.equal(expectedPositionData)

  if (checkErrors) {
    for (const storedPosition of storedPositionErrors) {
      const index = storedPositionErrors.indexOf(storedPosition)
      for (const key of errorKeys) {
        expect(storedPosition[key])
          .to.be.closeTo(positionErrors[index][key], 0.00000000000001)
      }
    }
  }
}

const checkPrimaryMetrics = function checkPrimaryMetrics(
  experimentMetrics,
  experimentName = "test-experiment",
  nonPositionData = true,
  isQuery = true
) {
  const metrics = isQuery ? experimentMetrics[0] : experimentMetrics
  expect(metrics.experimentName).to.equal(experimentName)
  if (isQuery) {
    expect(metrics.experiment.name).to.equal(experimentName)
  }
  const keysToOmit = nonPositionData
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
    expect(metrics[key])
      .to.be.closeTo(experimentPrimaryMetrics[key], 0.0000000000001)
  }
}

exports.positionDataNoErrors = positionDataNoErrors
exports.checkPositionData = checkPositionData
exports.checkPrimaryMetrics = checkPrimaryMetrics
