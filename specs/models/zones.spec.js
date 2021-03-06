const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect, assert } = require("chai")
const { keys, pick, sortBy, merge, omit } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Model Zone", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
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

  it("raises an error when the zone name already exists", async () => {
    try {
      await Zone.bulkCreate(
        [
          zones[0],
          merge({ name: "zone1" }, omit(zones[1], "name"))
        ]
      )
      assert.fail("", "Validation error", "No error was thrown")
    } catch (error) {
      expect(error.message).to.equal("Validation error")
    }
  })
})
