const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { isEqual, keys, pick } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
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
    const zoneSet = await ZoneSet.create({ name: "set1" })
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

  it("has a one to one relationship with PositionData", async () => {
    const positionData = await PositionData.findById(1)
    await ZoneAccuracy.create({ accuracy: true, positionDatumId: 1 })
    const storedZoneAccuracies = await ZoneAccuracy.findAll({
      where: { positionDatumId: 1 },
      include: [{ model: PositionData }]
    })
    expect(storedZoneAccuracies).to.have.length(1)
    expect(isEqual(
      pick(storedZoneAccuracies[0].position_datum, keys(positions[0])),
      pick(positionData, keys(positions[0]))
    )).to.equal(true)
  })

  it("has a one to one relationship with ZoneSet", async () => {
    await ZoneAccuracy.create({ accuracy: true, zoneSetName: "set1" })
    const storedZoneAccuracies = await ZoneAccuracy.findAll({
      include: [{ model: ZoneSet }]
    })
    expect(storedZoneAccuracies).to.have.length(1)
    expect(storedZoneAccuracies[0].zone_set.name)
      .to.deep.equal("set1")
  })
})
