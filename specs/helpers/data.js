const { concat, includes, keys, pick, sortBy } = require("lodash")
const { expect } = require("chai")
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

exports.positionDataNoErrors = positionDataNoErrors
exports.checkPositionData = checkPositionData
