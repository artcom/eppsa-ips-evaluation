const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")


describe("Model Point", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
  })

  it("can create points", async () => {
    await Point.bulkCreate(points)
    const queryResults = await Point.findAll()
    const storedPoints = queryResults
      .map(queryResult => pick(queryResult, keys(points[0])))
    expect(sortBy(storedPoints, ["pointId"]))
      .to.deep.equal(sortBy(points, ["PointId"]))
  })
})
