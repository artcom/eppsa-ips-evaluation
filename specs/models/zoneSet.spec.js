const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { concat, keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")
const ZoneSet = require("../../src/models/zoneSet")
const zoneSets = require("../testData/zoneSets.json")


describe("Model ZoneSet", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  it("can create zone sets", async () => {
    await Promise.all(
      zoneSets.map(zoneSet =>
        ZoneSet.create(
          zoneSet,
          { include: Zone }
        )
      )
    )
    const sets = await ZoneSet.findAll({ include: [{ model: Zone }] })
    const storedSets = sortBy(sets
      .map(set => sortBy(set.zones, ["name"]).map(zone => zone.name)), ["name"])
    expect(storedSets)
      .to.deep.equal(zoneSets.map(set => sortBy(set.zones, ["name"]).map(zone => zone.name)))
  })

  it("can add a zone to an empty set", async () => {
    await Zone.bulkCreate(zones)
    await ZoneSet.create({ name: "set1" }, { include: Zone })
    const zoneSet = await ZoneSet.findOne({ where: { name: "set1" } })
    await zoneSet.addZone(["zone1"])
    const zoneSet1 = await ZoneSet.findOne({ where: { name: "set1" }, include: [{ model: Zone }] })
    expect(zoneSet1.zones.map(zone => zone.name)).to.deep.equal(["zone1"])
  })

  it("can add a zone to a non empty set", async () => {
    const initialSet = {
      name: "set1",
      zones: [
        {
          name: "zone4",
          xMin: 2,
          xMax: 4,
          yMin: 2,
          yMax: 5,
          zMin: 1,
          zMax: 4
        }
      ]
    }
    await Zone.bulkCreate(zones)
    await ZoneSet.create(initialSet, { include: Zone })
    const zoneSet = await ZoneSet.findOne({ where: { name: "set1" } })
    await zoneSet.addZone(["zone2"])
    const zoneSets = await ZoneSet.findOne({ where: { name: "set1" }, include: [{ model: Zone }] })
    expect(zoneSets.zones.map(zone => zone.name).sort())
      .to.deep.equal(["zone2", "zone4"])
  })

  it("can add a zone to Zone", async () => {
    const newZone = {
      name: "zone4",
      xMin: 2,
      xMax: 4,
      yMin: 2,
      yMax: 5,
      zMin: 1,
      zMax: 4
    }
    const set = {
      name: "set1",
      zones: [newZone]
    }
    await Zone.bulkCreate(zones)
    await ZoneSet.create(set, { include: Zone })
    const storedZones = await Zone.findAll()
    expect(storedZones.map(zone => pick(zone, keys(zones[0]))))
      .to.deep.equal(concat(zones, newZone))
  })
})
