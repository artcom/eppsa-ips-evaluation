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
  updatePointsZones,
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

  describe("experiment", () => {
    describe("insertExperiment", () => {
      it("can create an experiment", async () => {
        await insertExperiment("test-experiment")
        const experiments = await Experiment.findAll()
        expect(experiments[0].name).to.equal("test-experiment")
      })
    })
  })

  describe("primary metrics", () => {
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
  })

  describe("node positions", () => {
    describe("upsertNodePosition", () => {
      it("inserts a node position when same node ID and experiment name is not present",
        async () => {
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
        }
      )

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
  })

  describe("points", () => {
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

    describe("insertPoints", () => {
      it("adds zones to points", async () => {
        await Zone.bulkCreate(concat(zones, zone4))
        await insertPoints(points)
        await checkPointZones(pointZones)
      })
    })

    describe("insertPoint", () => {
      it("adds zones to point", async () => {
        await Zone.bulkCreate(concat(zones, zone4))
        await insertPoint(points[0])
        await checkPointZones([pointZones[0]])
      })
    })

    describe("updatePointZones", () => {
      it("updates zones of point", async () => {
        await Zone.bulkCreate(zones)
        await insertPoint(points[0])
        await Zone.create(zone4)
        const point1 = await Point.findOne({ where: { name: "point1" } })
        await updatePointZones(point1)
        await checkPointZones([pointZones[0]])
      })
    })

    describe("updatePointsZones", () => {
      it("updates zones of points when a new zone is created", async () => {
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await Zone.create(zone4)
        await updatePointsZones()
        await checkPointZones(pointZones)
      })
    })

    describe("insertZones", () => {
      it("updates zones of points when a new zone is created", async () => {
        await Point.bulkCreate(points)
        await insertZones(concat(zones, zone4))
        await checkPointZones(pointZones)
      })
    })

    describe("insertZone", () => {
      it("updates zones of points when a new zone is created", async () => {
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await insertZone(zone4)
        await checkPointZones(pointZones)
      })
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

async function checkPointZones(pointZones) {
  const queryResults = await Point.findAll({ include: [{ model: Zone }] })
  const storedPoints = sortBy(queryResults.map(point => ({
    name: point.name,
    zones: point.zones.map(zone => zone.name).sort()
  })), ["name"])
  expect(storedPoints)
    .to.deep.equal(pointZones)
}
