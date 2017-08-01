const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
const { keys, pick, sortBy } = require("lodash")
const Point = require("../../src/models/point")
const { dbSync, dbDrop } = require("../helpers/db")
const points = require("../testData/points.json")
const server = require("../../src/server")
const { insertPoints } = require("../../src/storeData/index")

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
    insertPoints(points).then(() => {
      restler.get("http://localhost:3000/points").on("complete", (data, response) => {
        expect(response.statusCode).to.equal(200)
        expect(sortBy(data, ["name"])).to.deep.equal(sortBy(points, ["name"]))
        done()
      })
    })
  })

  it("should return point data on get at /points/point-name", done => {
    insertPoints(points).then(() => {
      restler.get("http://localhost:3000/points/point1")
        .on("complete", (data, response) => {
          expect(response.statusCode).to.equal(200)
          expect(data[0]).to.deep.equal(points[1])
          done()
        })
    })
  })

  it("should return point name in body and path in location header on single point post at /points",
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

  it("should store the point in the database on single point post at /points", done => {
    restler.post("http://localhost:3000/points", {
      data: points[1]
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const storedPoints = await Point.findAll()
      expect(pick(storedPoints[0], keys(points[1]))).to.deep.equal(points[1])
      done()
    })
  })

  it("should return point names in body and paths in location header on multiple point post at " +
    "/points/bulk",
    done => {
      restler.post("http://localhost:3000/points/bulk", {
        data: points
      }).on("complete", (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(response.headers.location).to.equal(
          "/points/point0; /points/point1; /points/point2; /points/point3"
        )
        expect(data).to.deep.equal([
          "point0",
          "point1",
          "point2",
          "point3"
        ])
        done()
      })
    }
  )

  it("should store the points in the database on multiple point post at /points/bulk", done => {
    restler.post("http://localhost:3000/points/bulk", {
      data: points
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const storedPointsQueryResult = await Point.findAll()
      const storedPoints = storedPointsQueryResult.map(point => pick(point, keys(points[0])))
      expect(storedPoints).to.deep.equal(points)
      done()
    })
  })
})
