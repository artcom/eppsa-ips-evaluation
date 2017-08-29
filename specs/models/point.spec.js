const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { assign, keys, pick, sortBy } = require("lodash")
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
    await Zone.bulkCreate(zones)
    await Point.bulkCreate(points)
    const queryResults = await Point.findAll()
    expect(queryResults.length)
      .to.equal(points.length)
  })

  it("adds zone to points", async () => {
    const zones = [
      { trueZoneLabel: "zone3" },
      { trueZoneLabel: "zone3" },
      { trueZoneLabel: "zone1" },
      { trueZoneLabel: "zone1" }
    ]
    const expectedStoredPoints = points.map((point, i) => assign(point, zones[i]))
    await Zone.bulkCreate(zones)
    await Point.bulkCreate(points)
    const queryResults = await Point.findAll()
    const storedPoints = queryResults
      .map(queryResult => pick(queryResult, keys(expectedStoredPoints[0])))
    expect(sortBy(storedPoints, ["pointId"]))
      .to.deep.equal(sortBy(expectedStoredPoints, ["PointId"]))
  })
})
