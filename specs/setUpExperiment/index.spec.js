const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Node = require("../../src/models/node")
const nodePositions = require("../testData/nodePositions.json")
const NodePosition = require("../../src/models/nodePosition")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const { insertPoints, insertExperiment, insertNodePositions } = require("../../src/storeData/index")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Set up experiment", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("insertPoints", () => {
    it("can create points", async () => {
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      const queryResults = await Point.findAll()
      const storedPoints = queryResults
        .map(queryResult => pick(queryResult, keys(points[0])))
      expect(sortBy(storedPoints, ["pointId"]))
        .to.deep.equal(sortBy(points, ["PointId"]))
    })
  })

  describe("insertExperiment", () => {
    it("can create an experiment", async () => {
      await insertExperiment("test-experiment")
      const experiments = await Experiment.findAll()
      expect(experiments[0].name).to.equal("test-experiment")
    })
  })

  describe("insertNodePositions", () => {
    it("can create node positions", async () => {
      await Experiment.create({ name: "test-experiment" })
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await insertNodePositions(nodePositions)
      const storedPositions = await NodePosition.findAll({ include: { model: Experiment } })
      const storedNodePositions = storedPositions
        .map(storedPosition => pick(storedPosition, keys(nodePositions[0])))
      for (const position of storedPositions) {
        expect(position.experiment.name).to.equal("test-experiment")
      }
      expect(sortBy(storedNodePositions, ["localizedNodeId"]))
        .to.deep.equal(sortBy(nodePositions, ["localizedNodeId"]))
    })
  })
})
