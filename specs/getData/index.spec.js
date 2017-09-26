const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { concat, keys, sortBy, pick } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const experiment = require("../testData/experiment.json")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const { insertExperiment, insertPoints, insertPositionData } = require("../../src/storeData")
const {
  getExperiments,
  getExperimentByName,
  getPoints,
  getPointByName,
  getNodes,
  getNodeByName,
  getNodePositions,
  getNodePositionByNodeName,
  getPositionDataByExperiment,
  getPositionDataByNode,
  getPositionDataByPoint,
  getExperimentMetricsByName,
  getZones,
  getZoneByName
} = require("../../src/getData")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const NodePosition = require("../../src/models/nodePosition")
const nodePositions = require("../testData/nodePositions.json")
const points = require("../testData/points.json")
const pointErrors = require("../testData/pointErrors.json")
const positionsWithErrors = require("../testData/positionsWithErrors.json")
const positionsWithZones = require("../testData/positionsWithZones.json")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("getData", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("getExperiment", () => {
    it("should return stored experiments", async () => {
      await insertExperiment("test-experiment")
      const experiments = await getExperiments()
      expect(experiments).to.deep.equal([experiment])
    })
  })

  describe("getExperimentByName", () => {
    it("should return the expected experiment by name", async () => {
      await insertExperiment("test-experiment")
      const storedExperiment = await getExperimentByName("test-experiment")
      expect(storedExperiment).to.deep.equal(experiment)
    })
  })

  describe("getPoints", () => {
    it("should return all stored points", async () => {
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      const storedPoints = await getPoints()
      expect(sortBy(storedPoints.map(storedPoint => pick(storedPoint, keys(points[0]))), ["name"]))
        .to.deep.equal(points)
    })
  })

  describe("getPointByName", () => {
    it("should return the expected point by name", async () => {
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      const storedPoint = await getPointByName("point2")
      expect(pick(storedPoint, keys(points[0]))).to.deep.equal(points[1])
    })
  })

  describe("getNodes", () => {
    it("should return all stored nodes", async () => {
      await Node.bulkCreate(nodes)
      const storedNodes = await getNodes()
      expect(storedNodes.map(storedNode => pick(storedNode, keys(nodes[0]))))
        .to.deep.equal(nodes)
    })
  })

  describe("getNodeByName", () => {
    it("should return the expected node by name", async () => {
      await Node.bulkCreate(nodes)
      const storedNode = await getNodeByName("Node2")
      expect(pick(storedNode, keys(nodes[0]))).to.deep.equal(nodes[1])
    })
  })

  describe("getZones", () => {
    it("should return all stored zones", async () => {
      await Zone.bulkCreate(zones)
      const storedZones = await getZones()
      expect(storedZones.map(storedZone => pick(storedZone, keys(zones[0]))))
        .to.deep.equal(zones)
    })
  })

  describe("getZoneByName", () => {
    it("should return the expected zone by name", async () => {
      await Zone.bulkCreate(zones)
      const storedZone = await getZoneByName("zone2")
      expect(pick(storedZone, keys(zones[0]))).to.deep.equal(zones[1])
    })
  })

  describe("getNodePositions", () => {
    it("should return all stored node positions", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositions)
      const storedNodePositions = await getNodePositions("test-experiment")
      expect(storedNodePositions.map(storedNodePosition =>
        pick(storedNodePosition, keys(nodePositions[0])))
      )
        .to.deep.equal(nodePositions)
    })
  })

  describe("getNodePositionsByNodeName", () => {
    it("should return the node position for the expected node by name", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositions)
      const storedNodePosition = await getNodePositionByNodeName("Node2", "test-experiment")
      expect(pick(storedNodePosition, keys(nodePositions[0]))).to.deep.equal(nodePositions[1])
    })
  })

  describe("getPositionDataByExperiment", () => {
    it("should return all position data for a given experiment", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await insertPositionData(positionsWithErrors)
      const storedPositionData = await getPositionDataByExperiment("test-experiment")
      checkPositionData(storedPositionData)
    })
  })

  describe("getPositionDataByPoint", () => {
    it("should return all position data for a given point", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await insertPositionData(positionsWithErrors)
      const storedPositionData = await getPositionDataByPoint("point1")
      expect(storedPositionData).to.have.length(1)
      expect(storedPositionData[0].pointName).to.equal("point1")
    })
  })

  describe("getPositionDataByNode", () => {
    it("should return all position data for a given node", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await insertPositionData(positionsWithErrors)
      const storedPositionData = await getPositionDataByNode("Node1")
      expect(storedPositionData).to.have.length(1)
      expect(storedPositionData[0].localizedNodeName).to.equal("Node1")
    })
  })

  describe("getExperimentMetricsByName", () => {
    it("should return the experiment metrics of the requested experiment", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await ExperimentMetrics.create(experimentPrimaryMetrics)
      const storedMetrics = await getExperimentMetricsByName("test-experiment")
      checkPrimaryMetrics(storedMetrics)
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
  expect(
    sortBy(queryResults, ["pointName"])
      .map(position => pick(position, keys(positionsWithZones[0])))
  ).to.deep.equal(positionsWithZones)
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
  expect(metrics.experimentName).to.equal("test-experiment")
  for (const key of errorKeys) {
    expect(metrics[key])
      .to.be.closeTo(
      experimentPrimaryMetrics[key],
      1e-14,
      `${metrics.experimentName} ${key}`
    )
  }
}
