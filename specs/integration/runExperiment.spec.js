const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const sinon = require("sinon")
const { pick } = require("lodash")
const { checkPositionData, checkPrimaryMetrics } = require("../helpers/data")
const { dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const { getMockData } = require("../mocks/getExperimentalData")
const { initializeDb } = require("../../src/initializeDb")
const { insertPoints, insertExperiment, insertNodePositions } = require("../../src/storeData")
const Node = require("../../src/models/node")
const nodePositionsQuuppa = require("../testData/nodePositionsQuuppa.json")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const QuuppaExperiment = require("../../src/runExperiment/quuppaExperiment")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Run a Quuppa experiment", () => {
  beforeEach(async () => {
    await dbDrop()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("Database initialization", () => {
    it("should set up the database", async () => {
      await initializeDb()
      await insertPoints(points)
      const insertedPoints = await Point.findAll()
      const storedPoints = insertedPoints.map(point => pick(point, [
        "name",
        "trueCoordinateX",
        "trueCoordinateY",
        "trueCoordinateZ",
        "trueZoneLabel"
      ]))
      expect(storedPoints).to.deep.equal(points)
    })
  })

  describe("Run", () => {
    it("should run the entire experiment and save the data", async () => {
      const quuppaExperiment = new QuuppaExperiment("test-experiment")
      const getData = sinon.stub(quuppaExperiment, "getQuuppaData").callsFake(getMockData)
      await initializeDb()
      await insertExperiment("test-experiment")
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await Zone.bulkCreate(zones)
      await insertNodePositions(nodePositionsQuuppa)
      await quuppaExperiment.run()
      sinon.assert.calledOnce(getData)
      await testMetrics()
    })
  })
})

async function testMetrics() {
  const experimentMetrics = await ExperimentMetrics.findAll({
    where: { experimentName: "test-experiment" },
    include: { model: Experiment }
  })
  await checkPrimaryMetrics({
    experimentMetrics,
    experimentName: "test-experiment",
    nonPositionData: false
  })
  const positionDataQueryResults = await PositionData.findAll()
  await checkPositionData(positionDataQueryResults, false)
}
