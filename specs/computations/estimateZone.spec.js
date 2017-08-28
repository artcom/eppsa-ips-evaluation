const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { dbSync, dbDrop } = require("../helpers/db")
const estimateZone = require("../../src/computations/estimateZone")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")

describe("estimateZone", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
  })

  it("should return the correct zone from coordinates", async () => {
    const points = [
      { zone: "zone1", coordinates: [3, 3, 2] },
      { zone: "zone2", coordinates: [5, 6, 3] },
      { zone: "zone3", coordinates: [1, 1, 0] }
    ]
    await Zone.bulkCreate(zones)
    expect(points.map(point => estimateZone(...point.coordinates)))
      .to.deep.equal(points.map(point => point.zone))
  })
})
