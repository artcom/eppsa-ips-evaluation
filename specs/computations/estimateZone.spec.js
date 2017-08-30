const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { dbSync, dbDrop } = require("../helpers/db")
const estimateZone = require("../../src/computations/estimateZone")
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

  it("should return the correct zone from coordinates", async () => {
    const points = [
      { zone: "zone1", coordinates: [3, 3, 2] },
      { zone: "zone2", coordinates: [5, 6, 3] },
      { zone: "zone3", coordinates: [1, 1, 0] }
    ]
    checkZones(points)
  })

  it("should return 'NA' when point is outside of all defined zones", async () => {
    const points = [
      { zone: "NA", coordinates: [9, 3, 3] },
      { zone: "NA", coordinates: [5, 3, 4] },
      { zone: "NA", coordinates: [1, 1, -1] }
    ]
    checkZones(points)
  })
})

async function checkZones(points) {
  const estimatedZones = await Promise.all(
    points.map(point => estimateZone(...point.coordinates))
  )

  expect(estimatedZones)
    .to.deep.equal(points.map(point => point.zone))
}
