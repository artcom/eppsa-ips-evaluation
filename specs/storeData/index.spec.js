const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { assign, keys, omit, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const {
  insertExperiment,
  insertPoint,
  insertPoints,
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
        localizedNodeId: "node1",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeId: "node1",
        pointName: "point2",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeId: "node1",
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
        localizedNodeId: "node1",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeId: "node2",
        pointName: "point2",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeId: "node2",
          experimentName: "test-experiment"
        }
      })
      expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
    })
  })

  describe("upsertNodePosition", () => {
    it("should insert node positions when not present", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      const initialPosition = {
        localizedNodeId: "node1",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      const upsertedPositions = [
        {
          localizedNodeId: "node2",
          pointName: "point1",
          experimentName: "test-experiment"
        },
        {
          localizedNodeId: "node3",
          pointName: "point3",
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

  describe("insertPoints", async () => {
    it("adds zone to points", async () => {
      const pointZones = [
        { trueZoneLabel: "zone3" },
        { trueZoneLabel: "zone1" },
        { trueZoneLabel: "zone1" }
      ]
      const pointsCopy = JSON.parse(JSON.stringify(points))
      const expectedStoredPoints = pointsCopy.map((point, i) => assign(point, pointZones[i]))
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

  describe("insertPositionData", async () => {
    it("adds zone to positionData when no zone is specified", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await insertPositionData(positions)
      const queryResults = await PositionData.findAll()
      const storedPositionData = queryResults
        .map(queryResult => pick(queryResult, keys(positionsWithZones[0])))
      expect(sortBy(storedPositionData, ["localizedNodeId"]))
        .to.deep.equal(sortBy(positionsWithZones, ["localizedNodeId"]))
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
      expect(sortBy(storedPositionData, ["localizedNodeId"]))
        .to.deep.equal(sortBy(positionsWithZones, ["localizedNodeId"]))
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
