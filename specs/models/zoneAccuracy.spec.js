const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { dbSync, dbDrop } = require("../helpers/db")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const positions = require("../testData/positions.json")
const { insertExperiment, insertPoints, insertPositionData } = require("../../src/storeData")
const Zone = require("../../src/models/zone")
const ZoneAccuracy = require("../../src/models/zoneAccuracy")
const zones = require("../testData/zones.json")
const ZoneSet = require("../../src/models/zoneSet")


describe("Model ZoneAccuracy", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await insertPositionData(positions)
    await ZoneSet.create({ name: "set1" }, { include: Zone })
    const zoneSet = await ZoneSet.findOne({ where: { name: "set1" } })
    await zoneSet.addZone(["zone1", "zone2"])
  })

  afterEach(async () => {
    await dbDrop()
  })

  it("can create zoneAccuracy rows", async () => {
    await ZoneAccuracy.create({ accuracy: true })
    const storedZoneAccuracies = await ZoneAccuracy.findAll()
    const zoneAccuracies = storedZoneAccuracies.map(zoneAccuracy => zoneAccuracy.accuracy)
    expect(zoneAccuracies).to.have.length(1)
    expect(zoneAccuracies[0]).to.equal(true)
  })
})
