const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
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

  it("should return all zones on get at /zones", done => {
    Zone.bulkCreate(zones).then(() => {
      restler.get("http://localhost:3000/zones").on("complete", (data, response) => {
        expect(response.statusCode).to.equal(200)
        expect(sortBy(data, ["name"])).to.deep.equal(sortBy(zones, ["name"]))
        done()
      })
    })
  })

  it("should return zone data on get at /zones/zone-name", done => {
    Zone.bulkCreate(zones).then(() => {
      restler.get("http://localhost:3000/zones/zone1")
        .on("complete", (data, response) => {
          expect(response.statusCode).to.equal(200)
          expect(data[0]).to.deep.equal(zones[1])
          done()
        })
    })
  })

  it("should return zone name in body and path in location header on single zone post at /zones",
    done => {
      restler.post("http://localhost:3000/zones", {
        data: zones[1]
      }).on("complete", (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(response.headers.location).to.equal("/zones/zone1")
        expect(data).to.equal("zone1")
        done()
      })
    }
  )

  it("should store the zone in the database on single zone post at /zones", done => {
    restler.post("http://localhost:3000/zones", {
      data: zones[1]
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const storedZones = await Zone.findAll()
      expect(pick(storedZones[0], keys(zones[1]))).to.deep.equal(zones[1])
      done()
    })
  })

  it("should return zone names in body and paths in location header on multiple zone post at " +
    "/zones/bulk",
    done => {
      restler.post("http://localhost:3000/zones/bulk", {
        data: zones
      }).on("complete", (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(response.headers.location).to.equal(
          "/zones/zone1; /zones/zone2; /zones/zone3"
        )
        expect(data).to.deep.equal([
          "zone1",
          "zone2",
          "zone3"
        ])
        done()
      })
    }
  )

  it("should store the zones in the database on multiple zone post at /zones/bulk", done => {
    restler.post("http://localhost:3000/zones/bulk", {
      data: zones
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const storedZonesQueryResult = await Zone.findAll()
      const storedZones = storedZonesQueryResult.map(zone => pick(zone, keys(zones[0])))
      expect(storedZones).to.deep.equal(zones)
      done()
    })
  })
})
