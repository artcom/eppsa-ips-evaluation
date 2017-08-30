const proxyquire = require("proxyquire")
const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const sinon = require("sinon")
const { concat, keys, pick, sortBy } = require("lodash")
const { dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetricsSimple = require("../testData/experimentPrimaryMetricsSimple.json")
const getQuuppaData = require("../../src/getExperimentalData/getQuuppaData")
const { getData } = require("../mocks/getExperimentalData")
const { initializeDb } = require("../../src/initializeDb")
const { insertPoints, insertExperiment } = require("../../src/storeData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodePositionsSimple = require("../testData/nodePositionsSimple.json")
const nodesSimple = require("../testData/nodesSimple.json")
const Point = require("../../src/models/point")
const pointsSimple = require("../testData/pointsSimple.json")
const pointErrorsSimple = require("../testData/pointErrorsSimple.json")
const PositionData = require("../../src/models/positionData")
const positionsWithZones = require("../testData/positionsWithZones.json")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Run a Quuppa experiment", () => {
  beforeEach(async () => {
    await dbDrop()
    this.getData = sinon.stub(getQuuppaData, "getQuuppaData").callsFake(getData)
    this.runQuuppaExperiment = proxyquire(
      "../../src/runExperiment/quuppaExperiment",
      { getQuuppaData: { getQuuppaData: this.getData } }
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
      await insertPoints(pointsSimple)
      const insertedPoints = await Point.findAll()
      const storedPoints = insertedPoints.map(point => pick(point, [
        "name",
        "trueCoordinateX",
        "trueCoordinateY",
        "trueCoordinateZ",
        "trueZoneLabel"
      ]))
      expect(storedPoints).to.deep.equal(pointsSimple)
    })
  })

  describe("Run", () => {
    it("should run the entire experiment and save the data", async () => {
      await initializeDb()
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(pointsSimple)
      await Node.bulkCreate(nodesSimple)
      await NodePosition.bulkCreate(nodePositionsSimple)
      await this.runQuuppaExperiment("test-experiment")
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
  checkPrimaryMetrics(experimentMetrics)
  const positionDataQueryResults = await PositionData.findAll()
  await checkPositionData(positionDataQueryResults, false)
}

function checkPrimaryMetrics(metrics) {
  const errorKeys = [
    "error2dAverage",
    "error2dMin",
    "error2dMax",
    "error2dVariance",
    "error2dMedian",
    "error2dRMS",
    "error2dPercentile75",
    "error2dPercentile90",
    "error3dAverage",
    "error3dMin",
    "error3dMax",
    "error3dVariance",
    "error3dMedian",
    "error3dRMS",
    "error3dPercentile75",
    "error3dPercentile90",
    "zoneAccuracyAverage"
  ]
  expect(metrics[0].experimentName).to.equal("test-experiment")
  for (const key of errorKeys) {
    expect(metrics[0][key])
      .to.be.closeTo(
      experimentPrimaryMetricsSimple[key],
      0.0000000000001,
      `${metrics.experimentName} ${key}`
    )
  }
}

function checkPositionData(queryResults) {
  const errorKeys = ["localizationError2d", "localizationError3d", "zoneAccuracy"]
  const storedPositionErrors = sortBy(
    queryResults
      .map(queryResult => pick(queryResult, concat(errorKeys, "pointName"))),
    ["pointName"]
  )
  expect(
    sortBy(queryResults, ["pointName"])
      .map(position => pick(position, keys(positionsWithZones[0])))
  ).to.deep.equal(positionsWithZones)
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

