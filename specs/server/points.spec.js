const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const rest = require("restling")
const { assign, keys, pick, set, sortBy } = require("lodash")
const { getPointByName } = require("../../src/getData")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const { dbSync, dbDrop } = require("../helpers/db")
const points = require("../testData/points.json")
const positionsWithErrors = require("../testData/positionsWithErrors.json")
const server = require("../../src/server")
const { insertExperiment, insertPoints, insertPositionData } = require("../../src/storeData/index")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")

describe("Server for points", () => {
  beforeEach(async () => {
    await dbSync()
    await Zone.bulkCreate(zones)
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all points on get at /points", async () => {
    const pointZones = [
      { trueZoneLabel: "zone3" },
      { trueZoneLabel: "zone1" },
      { trueZoneLabel: "zone1" }
    ]
    const pointsCopy = JSON.parse(JSON.stringify(points))
    const expectedStoredPoints = pointsCopy.map((point, i) => assign(point, pointZones[i]))
    await insertPoints(points)
    const result = await rest.get("http://localhost:3000/points")
    expect(result.response.statusCode).to.equal(200)
    expect(sortBy(result.data, ["name"])).to.deep.equal(sortBy(expectedStoredPoints, ["name"]))
  })

  it("should return point data on get at /points/point-name", async () => {
    const expectedStoredPoint = assign(
      Object.assign({}, points[0]),
      { trueZoneLabel: "zone3" }
    )
    await insertPoints(points)
    const result = await rest.get("http://localhost:3000/points/point1")
    expect(result.response.statusCode).to.equal(200)
    expect(result.data).to.deep.equal(expectedStoredPoint)
  })

  it("should return point name in body and path in location header on single point post at /points",
    async () => {
      const result = await rest.post("http://localhost:3000/points", { data: points[0] })
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location).to.equal("/points/point1")
      expect(result.data).to.equal("point1")
    }
  )

  it("should store the point in the database on single point post at /points", async () => {
    const expectedStoredPoint = assign(
      Object.assign({}, points[0]),
      { trueZoneLabel: "zone3" }
    )
    const result = await rest.post("http://localhost:3000/points", { data: points[0] })
    expect(result.response.statusCode).to.equal(201)
    const storedPoints = await Point.findAll()
    expect(pick(storedPoints[0], keys(expectedStoredPoint))).to.deep.equal(expectedStoredPoint)
  })

  it("should return point names in body and paths in location header on multiple point post at " +
    "/points",
    async () => {
      const result = await rest.post("http://localhost:3000/points", { data: points })
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location).to.equal(
        "/points/point1; /points/point2; /points/point3"
      )
      expect(result.data).to.deep.equal([
        "point1",
        "point2",
        "point3"
      ])
    }
  )

  it("should store the points in the database on multiple point post at /points", async () => {
    const pointZones = [
      { trueZoneLabel: "zone3" },
      { trueZoneLabel: "zone1" },
      { trueZoneLabel: "zone1" }
    ]
    const pointsCopy = JSON.parse(JSON.stringify(points))
    const expectedStoredPoints = pointsCopy.map((point, i) => assign(point, pointZones[i]))
    const result = await rest.post("http://localhost:3000/points", { data: points })
    expect(result.response.statusCode).to.equal(201)
    const storedPointsQueryResult = await Point.findAll()
    const storedPoints = storedPointsQueryResult.map(point =>
      pick(point, keys(expectedStoredPoints[0]))
    )
    expect(storedPoints).to.deep.equal(expectedStoredPoints)
  })

  it("should return the deleted point name on DELETE at /points/point-name",
    async () => {
      await insertPoints(points)

      const result = await rest.del("http://localhost:3000/points/point1")

      expect(result.data).to.equal("point1")
      expect(result.response.statusCode).to.equal(200)
    }
  )

  it(
    "should delete a point on DELETE at /points/point-name",
    async () => {
      await insertPoints(points)

      await rest.del("http://localhost:3000/points/point1")

      const point1 = await getPointByName("point1")

      expect(point1).to.equal(undefined)
    }
  )

  it("should not delete a point when it has experimental data associated with it", async () => {
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await insertExperiment("test-experiment")
    await insertPositionData(
      positionsWithErrors.map(position =>
        set(assign({}, position), "experimentName", "test-experiment")
      )
    )

    const result = await rest.del("http://localhost:3000/points/point1")

    const point1 = await getPointByName("point1")
    expect(result.data)
      .to.equal("Point \"point1\" has associated experimental data and was not deleted")

    expect(JSON.stringify(point1)).to.equal(JSON.stringify(points[0]))
  })
})
