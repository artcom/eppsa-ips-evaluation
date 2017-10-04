const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { omit, pick, sortBy } = require("lodash")
const proxyquire = require("proxyquire")
const sinon = require("sinon")
const { dbSync, dbDrop } = require("../helpers/db")
const ExperimentZoneAccuracy = require("../../src/models/experimentZoneAccuracy")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positions = require("../testData/positions.json")
const {
  insertExperiment,
  insertPoints,
  insertPositionData
} = require("../../src/storeData")
const storeData = require("../../src/storeData")
const updateData = require("../../src/storeData/updateData")
const Zone = require("../../src/models/zone")
const ZoneAccuracy = require("../../src/models/zoneAccuracy")
const zones = require("../testData/zones.json")
const ZoneSet = require("../../src/models/zoneSet")


describe("updateData", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await insertPositionData(positions)
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("zoneAccuracy", () => {
    it("should update zone accuracy for all positionData", async () => {
      const zoneSet = await ZoneSet.create({ name: "set1" })
      await zoneSet.addZone(["zone1", "zone3"])
      await updateData.zoneAccuracy("set1")
      const zoneAccuracies = await ZoneAccuracy.findAll({ include: [{ model: PositionData }] })
      const storedAccuracies = sortBy(zoneAccuracies.map(zoneAccuracy => ({
        accuracy: zoneAccuracy.accuracy,
        positionDatumId: zoneAccuracy.position_datum.id,
        zoneSetName: zoneAccuracy.zoneSetName
      })), ["positionDatumId"])
      const expectedAccuracies = [
        { positionDatumId: 1, accuracy: false, zoneSetName: "set1" },
        { positionDatumId: 2, accuracy: true, zoneSetName: "set1" },
        { positionDatumId: 3, accuracy: true, zoneSetName: "set1" }
      ]
      expect(zoneAccuracies).to.have.length(positions.length)
      expect(storedAccuracies).to.deep.equal(expectedAccuracies)
    })

    it("should use upsertZoneAccuracy for updating/creating zone accuracy", async () => {
      const upsertZoneAccuracyStub = sinon.stub(
        storeData,
        "upsertZoneAccuracy"
      )
      proxyquire(
        "../../src/storeData/updateData",
        { storeData: { upsertZoneAccuracy: upsertZoneAccuracyStub } }
      )
      const expectedAccuracies = [
        { positionDatumId: 1, accuracy: false, zoneSetName: "set1" },
        { positionDatumId: 2, accuracy: true, zoneSetName: "set1" },
        { positionDatumId: 3, accuracy: true, zoneSetName: "set1" }
      ]
      const zoneSet = await ZoneSet.create({ name: "set1" })
      await zoneSet.addZone(["zone1", "zone3"])
      await updateData.zoneAccuracy("set1")
      sinon.assert.calledThrice(upsertZoneAccuracyStub)
      for (const accuracy of expectedAccuracies) {
        sinon.assert.calledWith(upsertZoneAccuracyStub, accuracy)
      }
      upsertZoneAccuracyStub.restore()
    })
  })

  describe("experimentZoneAccuracy", () => {
    it("should compute the experiment zone accuracy average per zone set and store it",
      async () => {
        const zoneSet1 = await ZoneSet.create({ name: "set1" })
        await zoneSet1.addZone(["zone1", "zone2"])
        const zoneSet2 = await ZoneSet.create({ name: "set2" })
        await zoneSet2.addZone(["zone3"])
        await updateData.zoneAccuracy("set1")
        await updateData.zoneAccuracy("set2")
        await updateData.experimentZoneAccuracy("test-experiment")
        const experimentZoneAccuracy = await ExperimentZoneAccuracy.findAll()
        const storedAccuracies = sortBy(experimentZoneAccuracy.map(accuracy =>
          pick(accuracy, ["zoneSetName", "accuracyAverage", "experimentName"])
        ), ["zoneSetName"])
        const expectedAccuracies = [
          { zoneSetName: "set1", accuracyAverage: 1, experimentName: "test-experiment" },
          { zoneSetName: "set2", accuracyAverage: 2 / 3, experimentName: "test-experiment" }
        ]
        expect(
          storedAccuracies.map(storedAccuracy => omit(storedAccuracy, ["accuracyAverage"]))
        )
          .to.deep.equal(
            expectedAccuracies.map(expectedAccuracy => omit(expectedAccuracy, ["accuracyAverage"]))
        )
        for (const storedAccuracy of storedAccuracies) {
          const storedAverage = storedAccuracy.accuracyAverage
          const expectedAverage = expectedAccuracies[storedAccuracies.indexOf(storedAccuracy)]
            .accuracyAverage
          expect(storedAverage).to.be.closeTo(expectedAverage, 1e-14)
        }
      }
    )

    it("should use upsertExperimentZoneAccuracy to store the experiment zone accuracy",
      async () => {
        const upsertExperimentZoneAccuracyStub = sinon.stub(
          storeData,
          "upsertExperimentZoneAccuracy"
        )
        proxyquire(
          "../../src/storeData/updateData",
          { storeData: { upsertExperimentZoneAccuracy: upsertExperimentZoneAccuracyStub } }
        )
        const expectedAverage = {
          accuracyAverage: 1,
          experimentName: "test-experiment",
          zoneSetName: "set1"
        }
        const zoneSet1 = await ZoneSet.create({ name: "set1" })
        await zoneSet1.addZone(["zone1", "zone2"])
        await updateData.zoneAccuracy("set1")
        await updateData.experimentZoneAccuracy("test-experiment")
        sinon.assert.calledOnce(upsertExperimentZoneAccuracyStub)
        sinon.assert.calledWith(upsertExperimentZoneAccuracyStub, expectedAverage)
        upsertExperimentZoneAccuracyStub.restore()
      }
    )
  })
})
