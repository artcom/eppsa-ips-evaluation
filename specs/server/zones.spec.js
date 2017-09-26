const { describe, it, beforeEach, afterEach } = require("mocha")
const proxyquire = require("proxyquire")
const sinon = require("sinon")
const { expect } = require("chai")
const rest = require("restling")
const { keys, mapValues, pick, sortBy } = require("lodash")
const { getZoneByName } = require("../../src/getData")
const Zone = require("../../src/models/zone")
const { dbSync, dbDrop } = require("../helpers/db")
const zones = require("../testData/zones.json")
const server = require("../../src/server")
const storeData = require("../../src/storeData")


describe("Server for zones", () => {
  beforeEach(async () => {
    await dbSync()
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  describe("on GET", () => {
    it("should return all zones at /zones", async () => {
      await Zone.bulkCreate(zones)
      const result = await rest.get("http://localhost:3000/zones")
      const zonesRetrieved = sortBy(result.data, ["name"])
        .map(zone => pick(zone, keys(zones[0])))
      expect(result.response.statusCode).to.equal(200)
      expect(zonesRetrieved)
        .to.deep.equal(sortBy(zones, ["name"]))
    })

    it("should return zone data at /zones/zone-name", async () => {
      await Zone.bulkCreate(zones)
      const result = await rest.get("http://localhost:3000/zones/zone1")
      expect(result.response.statusCode).to.equal(200)
      expect(pick(result.data, keys(zones[0]))).to.deep.equal(zones[0])
    })
  })

  describe("on POST", () => {
    it("should return zone name in body and path in location header on single zone POST at /zones",
      async () => {
        const result = await rest.post("http://localhost:3000/zones", { data: zones[0] })
        expect(result.response.statusCode).to.equal(201)
        expect(result.response.headers.location).to.equal("/zones/zone1")
        expect(result.data).to.equal("zone1")
      }
    )

    it("should call updatePointZones on single zone POST at /zones", async () => {
      const insertZoneStub = sinon.stub(storeData, "insertZone")
      proxyquire("../../src/server/zones", { insertZone: insertZoneStub })
      const result = await rest.post("http://localhost:3000/zones", { data: zones[0] })
      expect(result.response.statusCode).to.equal(201)
      sinon.assert.calledOnce(insertZoneStub)
      sinon.assert.calledWith(insertZoneStub, mapValues(zones[0], value => value.toString()))
      insertZoneStub.restore()
    })

    it("should store the zone in the database on single zone POST at /zones", async () => {
      const result = await rest.post("http://localhost:3000/zones", { data: zones[0] })
      expect(result.response.statusCode).to.equal(201)
      const storedZones = await Zone.findAll()
      expect(pick(storedZones[0], keys(zones[0]))).to.deep.equal(zones[0])
    })

    it("should return zone names in body and paths in location header on multiple zone POST at " +
      "/zones",
      async () => {
        const result = await rest.post("http://localhost:3000/zones", { data: zones })
        expect(result.response.statusCode).to.equal(201)
        expect(result.response.headers.location).to.equal(
          "/zones/zone1; /zones/zone2; /zones/zone3"
        )
        expect(result.data).to.deep.equal([
          "zone1",
          "zone2",
          "zone3"
        ])
      }
    )

    it("should call updatePointZones on multiple zone POST at /zones", async () => {
      const insertZonesStub = sinon.stub(storeData, "insertZones")
      proxyquire("../../src/server/zones", { insertZones: insertZonesStub })
      const result = await rest.post("http://localhost:3000/zones", { data: zones })
      expect(result.response.statusCode).to.equal(201)
      sinon.assert.calledOnce(insertZonesStub)
      sinon.assert.calledWith(
        insertZonesStub,
        zones.map(zone => mapValues(zone, value => value.toString()))
      )
      insertZonesStub.restore()
    })

    it("should store the zones in the database on multiple zone POST at /zones", async () => {
      const result = await rest.post("http://localhost:3000/zones", { data: zones })
      expect(result.response.statusCode).to.equal(201)
      const storedZonesQueryResult = await Zone.findAll()
      const storedZones = storedZonesQueryResult.map(zone => pick(zone, keys(zones[0])))
      expect(storedZones).to.deep.equal(zones)
    })
  })

  describe("on DELETE", () => {
    it("should return the deleted zone name on DELETE at /zones/zone-name",
      async () => {
        await Zone.bulkCreate(zones)

        const result = await rest.del("http://localhost:3000/zones/zone1")

        expect(result.data).to.equal("zone1")
        expect(result.response.statusCode).to.equal(200)
      }
    )

    it(
      "should delete a zone on DELETE at /zones/zone-name",
      async () => {
        await Zone.bulkCreate(zones)

        await rest.del("http://localhost:3000/zones/zone1")

        const zone1 = await getZoneByName("zone1")
        expect(zone1).to.equal(undefined)
      }
    )

    it("should call updatePointZones when a zone is deleted", async () => {
      await Zone.bulkCreate(zones)
      const updatePointZonesStub = sinon.stub(storeData, "updatePointZones")
      proxyquire("../../src/server/zones", { updatePointZones: updatePointZonesStub })

      await rest.del("http://localhost:3000/zones/zone1")

      sinon.assert.calledOnce(updatePointZonesStub)
    })
  })
})
