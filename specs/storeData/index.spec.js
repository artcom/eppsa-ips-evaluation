const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { assign, concat, keys, omit, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const {
  insertExperiment,
  insertPoint,
  insertPoints,
  insertZone,
  insertZones,
  updatePointZones,
  insertPositionData,
  upsertPrimaryMetrics,
  upsertNodePosition,
  upsertNodePositions
} = require("../../src/storeData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const pointsWithZone = require("../testData/pointsWithZones.json")
const PositionData = require("../../src/models/positionData")
const positions = require("../testData/positions.json")
const positionsWithZones = require("../testData/positionsWithZones.json")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Store data", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("insertExperiment", () => {
    it("can create an experiment", async () => {
      await insertExperiment("test-experiment")
      const experiments = await Experiment.findAll()
      expect(experiments[0].name).to.equal("test-experiment")
    })
  })

  describe("upsertPrimaryMetrics", () => {
    it("inserts a primaryMetrics when experiment name is not present", async () => {
      await insertExperiment("test-experiment")
      const initialMetrics = assign({}, experimentPrimaryMetrics)
      assign(initialMetrics, { error2dAverage: 0.8 })
      await ExperimentMetrics.create(initialMetrics)
      await upsertPrimaryMetrics(experimentPrimaryMetrics)
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      expect(experimentMetrics.length).to.equal(1)
      checkPrimaryMetrics(experimentMetrics)
    })

    it("updates a node position when same node ID and experiment name is present", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      const initialPosition = {
        localizedNodeName: "Node1",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeName: "Node1",
        pointName: "point2",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeName: "Node1",
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
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      const initialPosition = {
        localizedNodeName: "Node1",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeName: "Node2",
        pointName: "point2",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeName: "Node2",
          experimentName: "test-experiment"
        }
      })
      expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
    })
  })

  describe("upsertNodePositions", () => {
    it("should insert node positions when not present", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      const initialPosition = {
        localizedNodeName: "Node1",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      const upsertedPositions = [
        {
          localizedNodeName: "Node2",
          pointName: "point1",
          experimentName: "test-experiment"
        },
        {
          localizedNodeName: "Node3",
          pointName: "point3",
          experimentName: "test-experiment"
        }
      ]
      await NodePosition.create(initialPosition)
      await upsertNodePositions(upsertedPositions)
      for (const upsertedPosition of upsertedPositions) {
        const insertedNodes = await NodePosition.findAll({
          where: {
            localizedNodeName: upsertedPosition.localizedNodeName,
            experimentName: upsertedPosition.experimentName
          }
        })
        expect(insertedNodes.length).to.equal(1)
        expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
      }

      it("should update present node positions and insert absent node positions", async () => {
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        const initialPosition = {
          localizedNodeId: "node1",
          pointName: "point0",
          experimentName: "test-experiment"
        }
        const upsertedPositions = [
          {
            localizedNodeId: "node1",
            pointName: "point1",
            experimentName: "test-experiment"
          },
          {
            localizedNodeId: "node2",
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
  })

  describe("insertPoints", () => {
    it("adds zone to points", async () => {
      const zone4 = {
        name: "zone4",
        xMin: 0,
        xMax: 4,
        yMin: 0,
        yMax: 4,
        zMin: 2,
        zMax: 3
      }
      const pointZones = [
        { zones: ["zone3", "zone4"], name: "point1" },
        { zones: ["zone1"], name: "point2" },
        { zones: ["zone1"], name: "point3" }
      ]
      await Zone.bulkCreate(concat(zones, zone4))
      await insertPoints(points)
      const queryResults = await Point.findAll({ include: [{ model: Zone }] })
      const storedPoints = queryResults.map(point => ({
        name: point.name,
        zones: point.zones.map(zone => zone.name).sort()
      }))
      expect(storedPoints)
        .to.deep.equal(pointZones)
    })
  })

  describe("insertPoint", () => {
    it("adds zone to point", async () => {
      const expectedStoredPoint = assign(
        Object.assign({}, points[0]),
        { trueZoneLabel: "zone3" }
      )
      await Zone.bulkCreate(zones)
      await insertPoint(points[0])
      const queryResults = await Point.findAll()
      const storedPoint = pick(queryResults[0], keys(expectedStoredPoint))
      expect(storedPoint)
        .to.deep.equal(expectedStoredPoint)
    })
  })

  describe("updatePointZones", () => {
    it("updates zones of points when a new zone is created", async () => {
      await Point.bulkCreate(points)
      await Zone.bulkCreate(zones)
      await updatePointZones()
      const queryResults = await Point.findAll()
      const storedPoints = queryResults
        .map(queryResult => pick(queryResult, keys(pointsWithZone[0])))
      expect(sortBy(storedPoints, ["name"]))
        .to.deep.equal(sortBy(pointsWithZone, ["name"]))
    })
  })

  describe("insertZones", () => {
    it("recomputes trueZoneLabel for points when a new zone is created", async () => {
      await Point.bulkCreate(points)
      await insertZones(zones)
      const queryResults = await Point.findAll()
      const storedPoints = queryResults
        .map(queryResult => pick(queryResult, keys(pointsWithZone[0])))
      expect(sortBy(storedPoints, ["name"]))
        .to.deep.equal(sortBy(pointsWithZone, ["name"]))
    })
  })

  describe("insertZone", () => {
    it("recomputes trueZoneLabel for points when a new zone is created", async () => {
      await Point.create(points[0])
      await insertZone(zones[2])
      const queryResults = await Point.findAll()
      const storedPoint = pick(queryResults[0], keys(pointsWithZone[0]))
      expect(storedPoint)
        .to.deep.equal(pointsWithZone[0])
    })
  })

  describe("insertPositionData", () => {
    it("adds zone to positionData when no zone is specified", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await insertPositionData(positions)
      const queryResults = await PositionData.findAll()
      const storedPositionData = queryResults
        .map(queryResult => pick(queryResult, keys(positionsWithZones[0])))
      expect(sortBy(storedPositionData, ["localizedNodeName"]))
        .to.deep.equal(sortBy(positionsWithZones, ["localizedNodeName"]))
    })

    it("stores positionData as is when zone is specified", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await insertPositionData(positionsWithZones)
      const queryResults = await PositionData.findAll()
      const storedPositionData = queryResults
        .map(queryResult => pick(queryResult, keys(positionsWithZones[0])))
      expect(sortBy(storedPositionData, ["localizedNodeName"]))
        .to.deep.equal(sortBy(positionsWithZones, ["localizedNodeName"]))
    })
  })
})

function checkPrimaryMetrics(metrics) {
  expect(metrics[0].experimentName).to.equal("test-experiment")
  for (const key of keys(omit(experimentPrimaryMetrics, ["experimentName"]))) {
    expect(metrics[0][key])
      .to.be.closeTo(
      experimentPrimaryMetrics[key],
      1e-14,
      key
    )
  }
}
