const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { dbSync, dbDrop } = require("../helpers/db")
const { getZones } = require("../../src/computations/estimateZone")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")

describe("estimateZone", () => {
  beforeEach(async () => {
    await dbSync()
    await Zone.bulkCreate(zones)
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("getZones", () => {
    it("should return all the zone names containing the point", async () => {
      const zone4 = {
        name: "zone4",
        xMin: 0,
        xMax: 4,
        yMin: 0,
        yMax: 4,
        zMin: 2,
        zMax: 3
      }
      await Zone.create(zone4)
      const points = [
        { zones: ["zone1", "zone4"], coordinates: [3, 3, 2] },
        { zones: ["zone2"], coordinates: [5, 6, 3] },
        { zones: ["zone3", "zone4"], coordinates: [1, 1, 2] },
        { zones: ["zone1"], coordinates: [2, 2, 3] },
        { zones: [], coordinates: [9, 3, 3] },
        { zones: [], coordinates: [5, 3, 4] },
        { zones: [], coordinates: [1, 1, -1] }
      ]
      const estimatedZones = await Promise.all(
        points.map(point => getZones(...point.coordinates))
      )

      expect(estimatedZones)
        .to.deep.equal(points.map(point => point.zones))
    })
  })
})
