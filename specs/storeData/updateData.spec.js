const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
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
const updateData = require("../../src/storeData/updateData")
const Zone = require("../../src/models/zone")
const ZoneAccuracy = require("../../src/models/zoneAccuracy")
const zones = require("../testData/zones.json")
const ZoneSet = require("../../src/models/zoneSet")


describe("updateData", () => {
  describe("zoneAccuracy", () => {
    beforeEach(async () => {
      await dbSync()
    })

    afterEach(async () => {
      await dbDrop()
    })

    it("should update zone accuracy for all positionData", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await insertPositionData(positions)
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
  })
})
