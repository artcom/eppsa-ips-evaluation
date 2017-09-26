const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Model Point", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  it("can create points", async () => {
    await Point.bulkCreate(points)
    const queryResults = await Point.findAll()
    const storedPoints = queryResults
      .map(queryResult => pick(queryResult, keys(points[0])))
    expect(sortBy(storedPoints, ["name"]))
      .to.deep.equal(sortBy(points, ["name"]))
  })

  it("can add a zone to a point", async () => {
    await Zone.bulkCreate(zones)
    await Point.bulkCreate(points)
    const point1 = await Point.findOne({ where: { name: "point1" } })
    await point1.addZone(["zone1"])
    const point1WithZone = await Point.findOne({
      where: { name: "point1" },
      include: [{ model: Zone }]
    })
    expect(point1WithZone.zones.map(zone => zone.name)).to.deep.equal(["zone1"])
  })
})
