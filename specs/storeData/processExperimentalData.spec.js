const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { concat, keys, omit, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetricsSimple = require("../testData/experimentPrimaryMetricsSimple.json")
const Node = require("../../src/models/node")
const nodesSimple = require("../testData/nodesSimple.json")
const pointErrorsSimple = require("../testData/pointErrorsSimple.json")
const pointsSimple = require("../testData/pointsSimple.json")
const positions = require("../testData/positions.json")
const PositionData = require("../../src/models/positionData")
const { insertExperiment, insertPoints, insertPositionData } = require("../../src/storeData")
const {
  updatePositionDataErrors,
  processData
} = require("../../src/storeData/processExperimentalData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Process experimental data", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(pointsSimple)
    await Node.bulkCreate(nodesSimple)
    await insertPositionData(positions)
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("updatePositionDataErrors", () => {
    it("updates the position data with the position error data", async () => {
      await updatePositionDataErrors(pointErrorsSimple, "test-experiment")
      const queryResults = await PositionData.findAll()
      await checkPositionData(queryResults)
    })
  })

  describe("processData", () => {
    it("updates the position data with the position error data", async () => {
      await processData("test-experiment")
      const queryResults = await PositionData.findAll()
      checkPositionData(queryResults)
    })

    it("stores experiment metrics", async () => {
      await processData("test-experiment")
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      checkPrimaryMetrics(experimentMetrics)
    })
  })
})

function checkPositionData(queryResults) {
  const errorKeys = ["localizationError2d", "localizationError3d", "zoneAccuracy"]
  const storedPositionErrors = sortBy(
    queryResults
      .map(queryResult => pick(queryResult, concat(errorKeys, "pointName"))),
    ["pointName"]
  )
  for (const storedPosition of storedPositionErrors) {
    const index = storedPositionErrors.indexOf(storedPosition)
    for (const key of errorKeys) {
      expect(storedPosition[key])
        .to.be.closeTo(
        pointErrorsSimple[index][key],
        0.00000000000001,
        key
      )
    }
  }
}

function checkPrimaryMetrics(queryResult) {
  for (const key of keys(omit(experimentPrimaryMetricsSimple, ["experimentName"]))) {
    expect(queryResult[0][key])
      .to.be.closeTo(
      experimentPrimaryMetricsSimple[key],
      0.0000000000001,
      key
    )
  }
}
