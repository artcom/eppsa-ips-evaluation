const { describe, it } = require("mocha")
const { expect } = require("chai")
const { keys, pick } = require("lodash")
const expectedPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const pointMeasurements = require("../testData/pointMeasurements.json")
const pointErrors = require("../testData/pointErrors.json")
const { percentile, primaryMetrics } = require("../../src/computations/primaryMetrics")


describe("Primary metrics computations", () => {
  describe("Percentile computations", () => {
    it("computes the p percentile of an array", () => {
      const testArray = [1, 2, 3, 4]
      const arrayPercentile75 = percentile(testArray, 0.75)

      expect(arrayPercentile75).to.equal(3.25)
    })
  })

  describe("Primary metrics", () => {
    it("returns a primary metrics object", () => {
      const experimentPrimaryMetrics = primaryMetrics(
        pointErrors,
        pointMeasurements,
        "test-experiment"
      )
      expect(pick(experimentPrimaryMetrics, keys(expectedPrimaryMetrics)))
        .to.deep.equal(expectedPrimaryMetrics)
    })
  })
})
