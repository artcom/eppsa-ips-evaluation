const { describe, it, beforeEach, afterEach } = require("mocha")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const pointErrors = require("../testData/pointErrors.json")
const points = require("../testData/points.json")
const positionData = require("../testData/positionData.json")
const PositionData = require("../../src/models/positionData")
const { positionDataNoErrors, checkPositionData, checkPrimaryMetrics } = require("../helpers/data")
const { insertPoints } = require("../../src/storeData")
const {
  updatePositionDataErrors,
  processData
} = require("../../src/storeData/processExperimentalData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Process experimental data", () => {
  beforeEach(async () => {
    await dbSync()
    await setUpDatabase()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("updatePositionDataErrors", () => {
    it("updates the position data with the position error data", async () => {
      await checkUpdatePositionDataErrors()
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
      checkPrimaryMetrics({ experimentMetrics })
    })
  })
})

async function setUpDatabase() {
  await Experiment.create({ name: "test-experiment" })
  await Zone.bulkCreate(zones)
  await insertPoints(points)
  await Node.bulkCreate(nodes)
  await PositionData.bulkCreate(positionDataNoErrors(positionData))
}

async function checkUpdatePositionDataErrors() {
  await updatePositionDataErrors(pointErrors, "test-experiment")
  const queryResults = await PositionData.findAll()
  await checkPositionData(queryResults)
}
