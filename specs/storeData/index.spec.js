const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { assign, concat, isEqual, keys, omit, pick, sortBy } = require("lodash")
const proxyquire = require("proxyquire")
const sinon = require("sinon")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const ExperimentZoneAccuracy = require("../../src/models/experimentZoneAccuracy")
const {
  addZonesToSet,
  insertExperiment,
  insertPoint,
  insertPoints,
  insertZone,
  insertZones,
  insertPositionData,
  updatePointZones,
  updatePointsZones,
  removeZonesFromSet,
  updatePositionDataZones,
  upsertExperimentZoneAccuracy,
  upsertPrimaryMetrics,
  upsertNodePosition,
  upsertNodePositions,
  upsertZoneAccuracy
} = require("../../src/storeData")
const updateData = require("../../src/storeData/updateData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positions = require("../testData/positions.json")
const Zone = require("../../src/models/zone")
const ZoneAccuracy = require("../../src/models/zoneAccuracy")
const zones = require("../testData/zones.json")
const ZoneSet = require("../../src/models/zoneSet")


describe("Store data", () => {
  const zone4 = {
    name: "zone4",
    xMin: 0,
    xMax: 4,
    yMin: 0,
    yMax: 4,
    zMin: 2,
    zMax: 3
  }

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
      it("updates zones of points when new zones are created", async () => {
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

  describe("position data", () => {
    const expectedZones = [[], ["zone1", "zone4"], ["zone1"]]

    describe("insertPositionData", () => {
      it("adds zone to positionData when no zone is specified", async () => {
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(concat(zones, zone4))
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        await insertPositionData(positions)
        await checkPositionDataZones(expectedZones)
      })

      it("updates zoneAccuracies when a positionData is created", async () => {
        const zoneAccuracyStub = sinon.stub(updateData, "zoneAccuracy")
        proxyquire(
          "../../src/storeData",
          { updateData: { zoneAccuracy: zoneAccuracyStub } }
        )
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(concat(zones, zone4))
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        const zoneSet1 = await ZoneSet.create({ name: "set1" })
        await zoneSet1.addZone(["zone1", "zone3"])
        const zoneSet2 = await ZoneSet.create({ name: "set2" })
        await zoneSet2.addZone(["zone2"])
        await insertPositionData(positions)
        sinon.assert.calledTwice(zoneAccuracyStub)
        sinon.assert.calledWith(zoneAccuracyStub, "set1")
        sinon.assert.calledWith(zoneAccuracyStub, "set2")
        zoneAccuracyStub.restore()
      })
    })

    describe("upsertZoneAccuracy", () => {
      it("should insert a zone accuracy when not already present", async () => {
        const positionData = await PositionData.create(
          pick(positions[0], ["estCoordinateX", "estCoordinateY", "estCoordinateZ"])
        )
        await ZoneSet.create({ name: "set1" })
        const newZoneAccuracy = {
          zoneSetName: "set1",
          positionDatumId: positionData.id,
          accuracy: true
        }
        await upsertZoneAccuracy(newZoneAccuracy)
        const zoneAccuracy = await ZoneAccuracy.findAll()
        const storedZoneAccuracy = pick(
          zoneAccuracy[0],
          ["zoneSetName", "positionDatumId", "accuracy"]
        )
        expect(zoneAccuracy).to.have.length(1)
        expect(isEqual(storedZoneAccuracy, newZoneAccuracy))
          .to.equal(true)
      })

      it("should update a zone accuracy when already present", async () => {
        const positionData = await PositionData.create(
          pick(positions[0], ["estCoordinateX", "estCoordinateY", "estCoordinateZ"])
        )
        await ZoneSet.create({ name: "set1" })
        const oldZoneAccuracy = {
          zoneSetName: "set1",
          positionDatumId: positionData.id,
          accuracy: false
        }
        const newZoneAccuracy = {
          zoneSetName: "set1",
          positionDatumId: positionData.id,
          accuracy: true
        }
        await ZoneAccuracy.create(oldZoneAccuracy)
        await upsertZoneAccuracy(newZoneAccuracy)
        const zoneAccuracy = await ZoneAccuracy.findAll()
        const storedZoneAccuracy = pick(
          zoneAccuracy[0],
          ["zoneSetName", "positionDatumId", "accuracy"]
        )
        expect(zoneAccuracy).to.have.length(1)
        expect(isEqual(storedZoneAccuracy, newZoneAccuracy))
          .to.equal(true, storedZoneAccuracy)
      })
    })

    describe("updatePositionDataZones", () => {
      it("updates zones of position data when new zones are created", async () => {
        await insertExperiment("test-experiment")
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        const createdPositionData = await PositionData.create(positions[1])
        await Zone.bulkCreate(concat(zones, zone4))
        await updatePositionDataZones(positions[1], createdPositionData.id)
        await checkPositionDataZones([expectedZones[1]])
      })
    })

    describe("insertZones", () => {
      it("updates zones of points when a new zone is created", async () => {
        await insertExperiment("test-experiment")
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        await insertPositionData(positions)
        await insertZones(concat(zones, zone4))
        await checkPositionDataZones(expectedZones)
      })
    })

    describe("insertZone", () => {
      it("updates zones of points when a new zone is created", async () => {
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        await insertPositionData(positions)
        await insertZone(zone4)
        await checkPositionDataZones(expectedZones)
      })
    })

    describe("addZonesToSet", () => {
      it("adds a zone to a zone set", async () => {
        await Zone.bulkCreate(zones)
        await ZoneSet.create({ name: "set1" })
        await addZonesToSet("set1", ["zone2", "zone3"])
        const storedSet1 = await ZoneSet.findOne({
          where: { name: "set1" },
          include: [{ model: Zone }]
        })
        expect(storedSet1.zones.map(zone => zone.name).sort())
          .to.deep.equal(["zone2", "zone3"])
      })

      it("calls updateData.zoneAccuracy when a zone is added to a set", async () => {
        const zoneAccuracyStub = sinon.stub(updateData, "zoneAccuracy")
        proxyquire(
          "../../src/storeData",
          { updateData: { zoneAccuracy: zoneAccuracyStub } }
        )
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        await insertPositionData(positions)
        await ZoneSet.create({ name: "set1" })
        await addZonesToSet("set1", ["zone2", "zone3"])
        sinon.assert.calledOnce(zoneAccuracyStub)
        sinon.assert.calledWith(zoneAccuracyStub, "set1")
        zoneAccuracyStub.restore()
      })

      it("calls updateData.experimentZoneAccuracy when a zone is added to a set", async () => {
        const experimentZoneAccuracyStub = sinon.stub(updateData, "experimentZoneAccuracy")
        proxyquire(
          "../../src/storeData",
          { updateData: { experimentZoneAccuracy: experimentZoneAccuracyStub } }
        )
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        await insertPositionData(positions)
        await ZoneSet.create({ name: "set1" })
        await addZonesToSet("set1", ["zone2", "zone3"])
        sinon.assert.calledOnce(experimentZoneAccuracyStub)
        sinon.assert.calledWith(experimentZoneAccuracyStub, "test-experiment")
        experimentZoneAccuracyStub.restore()
      })
    })

    describe("removeZonesFromSetStub", () => {
      it("removes a zone from a set", async () => {
        await Zone.bulkCreate(zones)
        const zoneSet1 = await ZoneSet.create({ name: "set1" })
        await zoneSet1.addZone(["zone1", "zone2"])
        await removeZonesFromSet("set1", ["zone1"])
        const storedSet1 = await ZoneSet.findOne({
          where: { name: "set1" },
          include: [{ model: Zone }]
        })
        expect(storedSet1.zones.map(zone => zone.name).sort())
          .to.deep.equal(["zone2"])
      })

      it("calls updateData.zoneAccuracy when a zone is removed from a set", async () => {
        const zoneAccuracyStub = sinon.stub(updateData, "zoneAccuracy")
        proxyquire(
          "../../src/storeData",
          { updateData: { zoneAccuracy: zoneAccuracyStub } }
        )
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        await insertPositionData(positions)
        const zoneSet1 = await ZoneSet.create({ name: "set1" })
        await zoneSet1.addZone(["zone1", "zone2"])
        await removeZonesFromSet("set1", ["zone1"])
        sinon.assert.calledOnce(zoneAccuracyStub)
        sinon.assert.calledWith(zoneAccuracyStub, "set1")
        zoneAccuracyStub.restore()
      })

      it("calls updateData.experimentZoneAccuracy when a zone is removed from a set", async () => {
        const experimentZoneAccuracyStub = sinon.stub(updateData, "experimentZoneAccuracy")
        proxyquire(
          "../../src/storeData",
          { updateData: { experimentZoneAccuracy: experimentZoneAccuracyStub } }
        )
        await insertExperiment("test-experiment")
        await Zone.bulkCreate(zones)
        await insertPoints(points)
        await Node.bulkCreate(nodes)
        await insertPositionData(positions)
        const zoneSet1 = await ZoneSet.create({ name: "set1" })
        await zoneSet1.addZone(["zone1", "zone2"])
        await removeZonesFromSet("set1", ["zone1"])
        sinon.assert.calledOnce(experimentZoneAccuracyStub)
        sinon.assert.calledWith(experimentZoneAccuracyStub, "test-experiment")
        experimentZoneAccuracyStub.restore()
      })
    })

    describe("upsertExperimentZoneAccuracy", () => {
      it("should insert a zone accuracy when not already present", async () => {
        const newAverage = {
          zoneSetName: "set1",
          accuracyAverage: 0.42,
          experimentName: "test-experiment"
        }
        await insertExperiment("test-experiment")
        await ZoneSet.create({ name: "set1" })
        await upsertExperimentZoneAccuracy(newAverage)
        const experimentZoneAccuracy = await ExperimentZoneAccuracy.findAll()
        const storedExperimentZoneAccuracy = pick(
          experimentZoneAccuracy[0],
          ["zoneSetName", "accuracyAverage", "experimentName"]
        )
        expect(experimentZoneAccuracy).to.have.length(1)
        expect(isEqual(storedExperimentZoneAccuracy, newAverage))
          .to.equal(true, storedExperimentZoneAccuracy)
      })

      it("should update a zone accuracy when already present", async () => {
        const oldAverage = {
          zoneSetName: "set1",
          accuracyAverage: 0.42,
          experimentName: "test-experiment"
        }
        const newAverage = {
          zoneSetName: "set1",
          accuracyAverage: 0.32,
          experimentName: "test-experiment"
        }
        await insertExperiment("test-experiment")
        await ZoneSet.create({ name: "set1" })
        await ExperimentZoneAccuracy.create(oldAverage)
        await upsertExperimentZoneAccuracy(newAverage)
        const experimentZoneAccuracy = await ExperimentZoneAccuracy.findAll()
        const storedExperimentZoneAccuracy = pick(
          experimentZoneAccuracy[0],
          ["zoneSetName", "accuracyAverage", "experimentName"]
        )
        expect(experimentZoneAccuracy).to.have.length(1)
        expect(isEqual(storedExperimentZoneAccuracy, newAverage)).to.equal(true)
      })
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

async function checkPositionDataZones(expectedZones) {
  const queryResults = await PositionData
    .findAll({ include: [{ model: Zone, as: "EstZone" }, { model: Node, as: "localizedNode" }] })
  const storedPositionData = sortBy(queryResults, ["localizedNodeName"])
      .map(queryResult => queryResult.EstZone.map(zone => zone.name).sort())
  expect(storedPositionData)
    .to.deep.equal(expectedZones)
}
