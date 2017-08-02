const { describe, it, beforeEach, afterEach } = require("mocha")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const Point = require("../../src/models/point")
const pointErrors = require("../testData/pointErrors.json")
const points = require("../testData/points.json")
const positionData = require("../testData/positionData.json")
const PositionData = require("../../src/models/positionData")
const { positionDataNoErrors, checkPositionData, checkPrimaryMetrics } = require("../helpers/data")
const {
  updatePositionDataErrors,
  processData
} = require("../../src/storeData/processExperimentalData")


describe("Process experimental data", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("updatePositionDataErrors", () => {
    it("updates the position data with the position error data", async () => {
      await checkUpdatePositionDataErrors()
    })
  })

  describe("processData basic function", () => {
    it("updates the position data with the position error data", async () => {
      await Experiment.create({ name: "test-experiment" })
      await Point.bulkCreate(points)
      await PositionData.bulkCreate(positionDataNoErrors(positionData))
      await processData("test-experiment")
      const queryResults = await PositionData.findAll()
      checkPositionData(queryResults)
    })

    it("stores experiment metrics", async () => {
      await Experiment.create({ name: "test-experiment" })
      await Point.bulkCreate(points)
      await PositionData.bulkCreate(positionDataNoErrors(positionData))
      await processData("test-experiment")
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      checkPrimaryMetrics(experimentMetrics)
    })
  })
})

async function setUpDatabase() {
  await Experiment.create({ name: "test-experiment" })
  await Point.bulkCreate(points)
  await PositionData.bulkCreate(positionDataNoErrors(positionData))
}

async function checkUpdatePositionDataErrors() {
  await setUpDatabase()
  await updatePositionDataErrors(pointErrors, "test-experiment")
  const queryResults = await PositionData.findAll()
  await checkPositionData(queryResults)
}
