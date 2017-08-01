const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
const { keys, pick, sortBy } = require("lodash")
const Point = require("../../src/models/point")
const { dbSync, dbDrop } = require("../helpers/db")
const points = require("../testData/points.json")
const server = require("../../src/server")
const { setUpPoints } = require("../../src/setUpExperiment")

describe("Server for points", () => {
  beforeEach(async () => {
    await dbSync()
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all points on get at /points", done => {
    setUpPoints(points).then(() => {
      restler.get("http://localhost:3000/points").on("complete", (data, response) => {
        expect(response.statusCode).to.equal(200)
        expect(sortBy(data, ["name"])).to.deep.equal(sortBy(points, ["name"]))
        done()
      })
    })
  })

  it("should return point data on get at /points/point-name", done => {
    setUpPoints(points).then(() => {
      restler.get("http://localhost:3000/points/point1")
        .on("complete", (data, response) => {
          expect(response.statusCode).to.equal(200)
          expect(data[0]).to.deep.equal(points[1])
          done()
        })
    })
  })

  it("should return point name in body and path in location header on post at /points",
    done => {
      restler.post("http://localhost:3000/points", {
        data: points[1]
      }).on("complete", (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(response.headers.location).to.equal("/points/point1")
        expect(data).to.equal("point1")
        done()
      })
    }
  )

  it("should store the point in the database on post at /points", done => {
    restler.post("http://localhost:3000/points", {
      data: points[1]
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const storedPoints = await Point.findAll()
      expect(pick(storedPoints[0], keys(points[1]))).to.deep.equal(points[1])
      done()
    })
  })
})
