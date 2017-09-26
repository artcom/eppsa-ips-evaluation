const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const rest = require("restling")
const { assign, includes, keys, pick, set, sortBy } = require("lodash")
const { getPointByName, getNodePositions } = require("../../src/getData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodes = require("../testData/nodes.json")
const nodePositions = require("../testData/nodePositions.json")
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
    await insertPoints(points)
    const result = await rest.get("http://localhost:3000/points")
    expect(result.response.statusCode).to.equal(200)
    expect(sortBy(result.data, ["name"])).to.deep.equal(sortBy(points, ["name"]))
  })

  it("should return point data on get at /points/point-name", async () => {
    await insertPoints(points)
    const result = await rest.get("http://localhost:3000/points/point1")
    expect(result.response.statusCode).to.equal(200)
    expect(result.data).to.deep.equal(points[0])
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
    const result = await rest.post("http://localhost:3000/points", { data: points[0] })
    expect(result.response.statusCode).to.equal(201)
    const storedPoints = await Point.findAll()
    expect(pick(storedPoints[0], keys(points[0]))).to.deep.equal(points[0])
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
    const result = await rest.post("http://localhost:3000/points", { data: points })
    expect(result.response.statusCode).to.equal(201)
    const storedPointsQueryResult = await Point.findAll()
    const storedPoints = sortBy(storedPointsQueryResult, ["name"]).map(point =>
      pick(point, keys(points[0]))
    )
    expect(storedPoints).to.deep.equal(points)
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

  it(
    "when a point is deleted all node positions associated with it should be deleted",
    async () => {
      await insertExperiment("test-experiment")
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositions)

      const initialPoint1Positions = await NodePosition.findAll({ where: { pointName: "point1" } })
      await rest.del("http://localhost:3000/points/point1")
      const finalPoint1Positions = await NodePosition.findAll({ where: { pointName: "point1" } })

      expect(initialPoint1Positions.map(position => position.localizedNodeName))
        .to.deep.equal(["Node1"])
      expect(finalPoint1Positions).to.have.length(0)
    }
  )

  it(
    "when a point is deleted there should be no node positions with no associated point",
    async () => {
      await insertExperiment("test-experiment")
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositions)

      await rest.del("http://localhost:3000/points/point1")
      const remainingNodePositions = await getNodePositions("test-experiment")

      expect(!includes(remainingNodePositions.map(position => position.pointName != null), false))
        .to.equal(true)
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
