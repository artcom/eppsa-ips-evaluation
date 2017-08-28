const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Model Zone", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
  })

  it("can create points", async () => {
    await Zone.bulkCreate(zones)
    const queryResults = await Zone.findAll()
    const storedZones = queryResults
      .map(queryResult => pick(queryResult, keys(zones[0])))
    expect(sortBy(storedZones, ["name"]))
      .to.deep.equal(sortBy(zones, ["name"]))
  })
})
