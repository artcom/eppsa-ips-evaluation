const proxyquire = require("proxyquire")
const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const sinon = require("sinon")
const { concat, keys, omit, pick, sortBy } = require("lodash")
const { dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const getQuuppaData = require("../../src/getExperimentalData/getQuuppaData")
const { getMockQuuppaData } = require("../mocks/getExperimentalData")
const goIndoor = require("../../src/goIndoor")
const { getFake } = require("../mocks/goIndoorServer")
const { initializeDb } = require("../../src/initializeDb")
const { insertPoints, insertExperiment } = require("../../src/storeData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodePositions = require("../testData/nodePositions.json")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const pointErrors = require("../testData/pointErrors.json")
const PositionData = require("../../src/models/positionData")
const positionsWithZones = require("../testData/positionsWithZones.json")
const { runGoIndoorExperiment } = require("../../src/runExperiment/goIndoorExperiment")
const runQuuppaExperiment = require("../../src/runExperiment/quuppaExperiment")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Run", () => {
  beforeEach(async () => {
    await dbDrop()
  })

  afterEach(async () => {
    await dbDrop()
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

  describe("a Quuppa experiment", () => {
    let getQuuppaDataStub

    beforeEach(() => {
      getQuuppaDataStub = sinon.stub(getQuuppaData, "getQuuppaData").callsFake(getMockQuuppaData)
      proxyquire(
        "../../src/runExperiment/quuppaExperiment",
        { getQuuppaData: { getQuuppaData: getQuuppaDataStub } }
      )
    })

    afterEach(async () => {
      getQuuppaData.getQuuppaData.restore()
    })

    describe("Run", () => {
      it("should run the entire experiment and save the data", async () => {
        await initializeDb()
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        await NodePosition.bulkCreate(nodePositions)
        await runQuuppaExperiment("test-experiment")
        sinon.assert.calledOnce(getQuuppaDataStub)
        await testMetrics()
      })
    })
  })

  describe("a GoIndoor experiment", () => {
    let goIndoorServerGetMock

    beforeEach(() => {
      goIndoorServerGetMock = sinon.stub(goIndoor.goIndoorServer, "get").callsFake(getFake)
      proxyquire(
        "../../src/getExperimentalData/getGoIndoorData",
        { goIndoorServer: { get: goIndoorServerGetMock } }
      )
    })

    afterEach(() => {
      goIndoorServerGetMock.restore()
    })

    it("should run the experiment and save the data", async () => {
      await initializeDb()
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositions)
      await runGoIndoorExperiment("test-experiment")
      sinon.assert.callCount(goIndoorServerGetMock, 4)
      await testMetrics(false)
    })
  })
})

function checkPositionData(queryResults, with3d) {
  const errorKeys = with3d
    ? ["localizationError2d", "localizationError3d", "zoneAccuracy"]
    : ["localizationError2d", "zoneAccuracy"]
  const omitKeys = with3d ? [] : ["estCoordinateZ"]
  const storedPositionErrors = sortBy(
    queryResults
      .map(queryResult => pick(queryResult, concat(errorKeys, "pointName"))),
    ["pointName"]
  )
  expect(
    sortBy(queryResults, ["pointName"])
      .map(position => omit(pick(position, keys(positionsWithZones[0])), omitKeys))
  ).to.deep.equal(positionsWithZones.map(position => omit(position, omitKeys)))
  for (const storedPosition of storedPositionErrors) {
    const index = storedPositionErrors.indexOf(storedPosition)
    for (const key of errorKeys) {
      expect(storedPosition[key])
        .to.be.closeTo(
        pointErrors[index][key],
        1e-14,
        key
      )
    }
  }
}

async function testMetrics(with3d = true) {
  const experimentMetrics = await ExperimentMetrics.findAll({
    where: { experimentName: "test-experiment" },
    include: [{ model: Experiment }]
  })
  checkPrimaryMetrics(experimentMetrics, with3d)
  const positionDataQueryResults = await PositionData.findAll()
  await checkPositionData(positionDataQueryResults, with3d)
}

function checkPrimaryMetrics(metrics, with3d) {
  const errorKeys = with3d
    ? [
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
    : [
      "error2dAverage",
      "error2dMin",
      "error2dMax",
      "error2dVariance",
      "error2dMedian",
      "error2dRMS",
      "error2dPercentile75",
      "error2dPercentile90",
      "zoneAccuracyAverage"
    ]
  expect(metrics[0].experimentName).to.equal("test-experiment")
  for (const key of errorKeys) {
    expect(metrics[0][key])
      .to.be.closeTo(
      experimentPrimaryMetrics[key],
      1e-14,
      `${metrics.experimentName} ${key}`
    )
  }
}

