const proxyquire = require("proxyquire")
const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const sinon = require("sinon")
const { pick } = require("lodash")
const { checkPositionData, checkPrimaryMetrics } = require("../helpers/data")
const { dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const getQuuppaData = require("../../src/getExperimentalData/getQuuppaData")
const { getMockData } = require("../mocks/getExperimentalData")
const { initializeDb } = require("../../src/initializeDb")
const { insertPoints, insertExperiment } = require("../../src/storeData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodePositionsQuuppa = require("../testData/nodePositionsQuuppa.json")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Run a Quuppa experiment", () => {
  beforeEach(async () => {
    await dbDrop()
    this.getData = sinon.stub(getQuuppaData, "getQuuppaData").callsFake(getMockData)
    this.QuuppaExperiment = proxyquire(
      "../../src/runExperiment/quuppaExperiment",
      { getExperimentalData: { getQuuppaData: this.getData } }
    )
  })

  afterEach(async () => {
    await dbDrop()
    getQuuppaData.getQuuppaData.restore()
  })

  describe("Database initialization", () => {
    it("should set up the database", async () => {
      await initializeDb()
      await Zone.bulkCreate(zones)
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
      const quuppaExperiment = new this.QuuppaExperiment("test-experiment")
      await initializeDb()
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositionsQuuppa)
      await quuppaExperiment.run()
      sinon.assert.calledOnce(this.getData)
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
