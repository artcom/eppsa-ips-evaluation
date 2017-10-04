const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentZoneAccuracy = require("../../src/models/experimentZoneAccuracy")
const { insertExperiment } = require("../../src/storeData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")
const ZoneSet = require("../../src/models/zoneSet")


describe("Model ExperimentZoneAccuracy", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    const zoneSet = await ZoneSet.create({ name: "set1" }, { include: Zone })
    await zoneSet.addZone(["zone1", "zone2"])
  })

  afterEach(async () => {
    await dbDrop()
  })

  it("can create zoneAccuracy rows", async () => {
    await ExperimentZoneAccuracy.create({ accuracyAverage: 0.54 })
    const storedZoneAccuracies = await ExperimentZoneAccuracy.findAll()
    const zoneAccuracies = storedZoneAccuracies.map(zoneAccuracy => zoneAccuracy.accuracyAverage)
    expect(zoneAccuracies).to.have.length(1)
    expect(zoneAccuracies[0]).to.equal(0.54)
  })

  it("has a one to one relationship with Experiment", async () => {
    await ExperimentZoneAccuracy.create({
      accuracyAverage: 0.54,
      experimentName: "test-experiment"
    })
    const storedZoneAccuracies = await ExperimentZoneAccuracy.findAll({
      include: [{ model: Experiment }]
    })
    expect(storedZoneAccuracies).to.have.length(1)
    expect(storedZoneAccuracies[0].experiment.name)
      .to.deep.equal("test-experiment")
  })

  it("has a one to one relationship with ZoneSet", async () => {
    await ExperimentZoneAccuracy.create({ accuracyAverage: 0.54, zoneSetName: "set1" })
    const storedZoneAccuracies = await ExperimentZoneAccuracy.findAll({
      include: [{ model: ZoneSet }]
    })
    expect(storedZoneAccuracies).to.have.length(1)
    expect(storedZoneAccuracies[0].zone_set.name)
      .to.deep.equal("set1")
  })
})
