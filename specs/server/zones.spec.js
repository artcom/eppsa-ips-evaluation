const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const rest = require("restling")
const { keys, pick, sortBy } = require("lodash")
const Zone = require("../../src/models/zone")
const { dbSync, dbDrop } = require("../helpers/db")
const zones = require("../testData/zones.json")
const server = require("../../src/server")


describe("Server for zones", () => {
  beforeEach(async () => {
    await dbSync()
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all zones on get at /zones", async () => {
    await Zone.bulkCreate(zones)
    const result = await rest.get("http://localhost:3000/zones")
    expect(result.response.statusCode).to.equal(200)
    expect(sortBy(result.data, ["name"])).to.deep.equal(sortBy(zones, ["name"]))
  })

  it("should return zone data on get at /zones/zone-name", async () => {
    await Zone.bulkCreate(zones)
    const result = await rest.get("http://localhost:3000/zones/zone1")
    expect(result.response.statusCode).to.equal(200)
    expect(result.data).to.deep.equal(zones[0])
  })

  it("should return zone name in body and path in location header on single zone post at /zones",
    async () => {
      const result = await rest.post("http://localhost:3000/zones", { data: zones[0] })
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location).to.equal("/zones/zone1")
      expect(result.data).to.equal("zone1")
    }
  )

  it("should store the zone in the database on single zone post at /zones", async () => {
    const result = await rest.post("http://localhost:3000/zones", { data: zones[0] })
    expect(result.response.statusCode).to.equal(201)
    const storedZones = await Zone.findAll()
    expect(pick(storedZones[0], keys(zones[0]))).to.deep.equal(zones[0])
  })

  it("should return zone names in body and paths in location header on multiple zone post at " +
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

  it("should store the zones in the database on multiple zone post at /zones", async () => {
    const result = await rest.post("http://localhost:3000/zones", { data: zones })
    expect(result.response.statusCode).to.equal(201)
    const storedZonesQueryResult = await Zone.findAll()
    const storedZones = storedZonesQueryResult.map(zone => pick(zone, keys(zones[0])))
    expect(storedZones).to.deep.equal(zones)
  })
})
