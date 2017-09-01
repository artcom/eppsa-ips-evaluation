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
  getNodes,
  getZones,
  getZoneByName
} = require("../../src/getData")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
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
    it("should return the correct experiment by name", async () => {
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

  describe("getNodes", () => {
    it("should return all stored nodes", async () => {
      await Node.bulkCreate(nodes)
      const storedNodes = await getNodes()
      expect(storedNodes.map(storedNode => pick(storedNode, keys(nodes[0]))))
        .to.deep.equal(nodes)
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
})
