const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, pick } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const experiment = require("../testData/experiment.json")
const { insertExperiment, insertPoints } = require("../../src/storeData")
const {
  getExperiments,
  getExperimentByName,
  getPoints,
  getPointByName,
  getNodes,
  getNodesByName,
  getNodePositions,
  getNodePositionByNodeId,
  getZones,
  getZoneByName
} = require("../../src/getData")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const NodePosition = require("../../src/models/nodePosition")
const nodePositions = require("../testData/nodePositions.json")
const points = require("../testData/points.json")
const pointsWithZones = require("../testData/pointsWithZones.json")
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
      expect(storedPoints.map(storedPoint => pick(storedPoint, keys(pointsWithZones[0]))))
        .to.deep.equal(pointsWithZones)
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

  describe("getNodesByName", () => {
    it("should return the expected node by name", async () => {
      await Node.bulkCreate(nodes)
      const storedNode = await getNodesByName("Node2")
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

  describe("getNodePositionsByNodeId", () => {
    it("should return the node position for the expected node by ID", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositions)
      const storedNodePosition = await getNodePositionByNodeId("node2", "test-experiment")
      expect(pick(storedNodePosition, keys(nodePositions[0]))).to.deep.equal(nodePositions[1])
    })
  })
})
