const { expect } = require("chai")
const { isEqual } = require("lodash")
const { describe, it, beforeEach, afterEach } = require("mocha")
const proxyquire = require("proxyquire")
const rest = require("restling")
const sinon = require("sinon")
const { dbSync, dbDrop } = require("../helpers/db")
const server = require("../../src/server")
const storeData = require("../../src/storeData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")
const ZoneSet = require("../../src/models/zoneSet")
const zoneSets = require("../testData/zoneSets.json")


describe("Server for zone sets", () => {
  beforeEach(async () => {
    await dbSync()
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  describe("on GET", () => {
    it("should return all zone sets at /zone-sets", async () => {
      await Promise.all(
        zoneSets.map(zoneSet =>
          ZoneSet.create(
            zoneSet,
            { include: Zone }
          )
        )
      )
      const result = await rest.get("http://localhost:3000/zone-sets")
      expect(result.response.statusCode).to.equal(200)
      expect(result.data).to.deep.equal(zoneSets)
    })

    it("should return the zone set at /zone-sets/zone-set-name", async () => {
      await Promise.all(
        zoneSets.map(zoneSet =>
          ZoneSet.create(
            zoneSet,
            { include: Zone }
          )
        )
      )
      const result = await rest.get("http://localhost:3000/zone-sets/set1")
      expect(result.response.statusCode).to.equal(200)
      expect(result.data).to.deep.equal(zoneSets[0])
    })
  })

  describe("on POST", () => {
    it("should return the zone set name in body and path in location header on POST at /zone-sets",
      async () => {
        const result = await rest.post(
          "http://localhost:3000/zone-sets",
          { data: { name: "set1" } }
        )
        expect(result.response.statusCode).to.equal(201)
        expect(result.response.headers.location).to.equal("/zone-sets/set1")
        expect(result.data).to.equal("set1")
      }
    )

    it("should store the zone set in the database on POST at /zone-sets", async () => {
      const result = await rest.post(
        "http://localhost:3000/zone-sets",
        { data: { name: "set1" } }
      )
      expect(result.response.statusCode).to.equal(201)
      const zoneSets = await ZoneSet.findAll()
      expect(zoneSets).to.have.length(1)
      expect(zoneSets[0].name).to.equal("set1")
    })

    it("should return the zone set and zone names in body and path in location header on POST at " +
      "/zone-sets/zone-set-name", async () => {
      await ZoneSet.create({ name: "set1" })
      await Zone.bulkCreate(zones)
      const result = await rest.post(
        "http://localhost:3000/zone-sets/set1",
        { data: { zoneName: "zone1" } }
      )
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location).to.equal("/zone-sets/set1/zone1")
      expect(isEqual(result.data, { zoneSetName: "set1", zoneName: "zone1" })).to.equal(true)
    })

    it("should add a zone to the zone set on POST at /zone-sets/zone-set-name", async () => {
      await ZoneSet.create({ name: "set1" })
      await Zone.bulkCreate(zones)
      await rest.post(
        "http://localhost:3000/zone-sets/set1",
        { data: { zoneName: "zone1" } }
      )
      const zoneSets = await ZoneSet.findAll({ include: [{ model: Zone }] })
      expect(zoneSets).to.have.length(1)
      expect(zoneSets[0].zones.map(zone => zone.name)).to.deep.equal(["zone1"])
    })

    it("should call addZonesToSet on POST at /zone-sets/zone-set-name", async () => {
      const addZonesToSetStub = sinon.stub(storeData, "addZonesToSet")
      proxyquire("../../src/server/zoneSets", { storeData: { addZonesToSet: addZonesToSetStub } })
      await ZoneSet.create({ name: "set1" })
      await Zone.bulkCreate(zones)
      await rest.post(
        "http://localhost:3000/zone-sets/set1",
        { data: { zoneName: "zone1" } }
      )
      sinon.assert.calledOnce(addZonesToSetStub)
      sinon.assert.calledWith(addZonesToSetStub, "set1", ["zone1"])
      addZonesToSetStub.restore()
    })
  })
})
