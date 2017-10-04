const { expect } = require("chai")
const { describe, it, beforeEach, afterEach } = require("mocha")
const rest = require("restling")
const { dbSync, dbDrop } = require("../helpers/db")
const server = require("../../src/server")
const Zone = require("../../src/models/zone")
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
  })
})
