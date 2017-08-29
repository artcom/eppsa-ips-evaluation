const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { assign, keys, pick, sortBy } = require("lodash")
const { checkPrimaryMetrics } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const {
  insertExperiment,
  insertPoints,
  insertPrimaryMetrics,
  upsertPrimaryMetrics,
  upsertNodePosition,
  upsertNodePositions
} = require("../../src/storeData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Store data", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("insertPrimaryMetrics", () => {
    it("stores experiment metrics", async () => {
      await Experiment.create({ name: "test-experiment" })
      await insertPrimaryMetrics(experimentPrimaryMetrics)
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      checkPrimaryMetrics({ experimentMetrics })
    })
  })

  describe("upsertPrimaryMetrics", () => {
    it("inserts a primaryMetrics when experiment name is not present", async () => {
      await insertExperiment("test-experiment")
      const initialMetrics = assign({}, experimentPrimaryMetrics)
      assign(initialMetrics, { error2dAverage: 0.8 })
      await insertPrimaryMetrics(initialMetrics)
      await upsertPrimaryMetrics(experimentPrimaryMetrics)
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      expect(experimentMetrics.length).to.equal(1)
      checkPrimaryMetrics({ experimentMetrics })
    })

    it("updates a node position when same node ID and experiment name is present", async () => {
      await insertExperiment("test-experiment")
      await Point.bulkCreate(points)
      await Node.bulkCreate(nodes)
      const initialPosition = {
        localizedNodeId: "20914830f65a",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeId: "20914830f65a",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeId: "20914830f65a",
          experimentName: "test-experiment"
        }
      })
      expect(insertedNodes.length).to.equal(1)
      expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
    })
  })

  describe("upsertNodePosition", () => {
    it("inserts a node position when same node ID and experiment name is not present", async () => {
      await insertExperiment("test-experiment")
      await Point.bulkCreate(points)
      await Node.bulkCreate(nodes)
      const initialPosition = {
        localizedNodeId: "20914830ce00",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeId: "20914830f65a",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeId: "20914830f65a",
          experimentName: "test-experiment"
        }
      })
      expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
    })
  })

  describe("upsertNodePositions", () => {
    it("should insert node positions when not present", async () => {
      await insertExperiment("test-experiment")
      await Point.bulkCreate(points)
      await Node.bulkCreate(nodes)
      const initialPosition = {
        localizedNodeId: "20914830ce00",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPositions = [
        {
          localizedNodeId: "20914830f65a",
          pointName: "point1",
          experimentName: "test-experiment"
        },
        {
          localizedNodeId: "6655443322dd",
          pointName: "point2",
          experimentName: "test-experiment"
        }
      ]
      await NodePosition.create(initialPosition)
      await upsertNodePositions(upsertedPositions)
      for (const upsertedPosition of upsertedPositions) {
        const insertedNodes = await NodePosition.findAll({
          where: {
            localizedNodeId: upsertedPosition.localizedNodeId,
            experimentName: upsertedPosition.experimentName
          }
        })
        expect(insertedNodes.length).to.equal(1)
        expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
      }
    })

    it("should update present node positions and insert absent node positions", async () => {
      await insertExperiment("test-experiment")
      await Point.bulkCreate(points)
      await Node.bulkCreate(nodes)
      const initialPosition = {
        localizedNodeId: "20914830f65a",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPositions = [
        {
          localizedNodeId: "20914830f65a",
          pointName: "point1",
          experimentName: "test-experiment"
        },
        {
          localizedNodeId: "20914830ce00",
          pointName: "point2",
          experimentName: "test-experiment"
        }
      ]
      await NodePosition.create(initialPosition)
      await upsertNodePositions(upsertedPositions)
      for (const upsertedPosition of upsertedPositions) {
        const insertedNodes = await NodePosition.findAll({
          where: {
            localizedNodeId: upsertedPosition.localizedNodeId,
            experimentName: upsertedPosition.experimentName
          }
        })
        expect(insertedNodes.length).to.equal(1)
        expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
      }
    })
  })

  describe("insertPoints", async () => {
    it("adds zone to points", async () => {
      const pointZones = [
        { trueZoneLabel: "zone3" },
        { trueZoneLabel: "zone3" },
        { trueZoneLabel: "zone1" },
        { trueZoneLabel: "zone1" }
      ]
      const expectedStoredPoints = points.map((point, i) => assign(point, pointZones[i]))
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      const queryResults = await Point.findAll()
      const storedPoints = queryResults
        .map(queryResult => pick(queryResult, keys(expectedStoredPoints[0])))
      expect(sortBy(storedPoints, ["pointId"]))
        .to.deep.equal(sortBy(expectedStoredPoints, ["PointId"]))
    })
  })

  describe("insertPoint", async () => {
    it("adds zone to point", async () => {
      const expectedStoredPoint = assign(points[0], { trueZoneLabel: "zone3" })
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      const queryResults = await Point.findAll()
      const storedPoint = pick(queryResults[0], keys(expectedStoredPoint))
      expect(storedPoint)
        .to.deep.equal(expectedStoredPoint)
    })
  })
})
