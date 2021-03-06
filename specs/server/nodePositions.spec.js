const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const rest = require("restling")
const { keys, omit, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const nodePositions = require("../testData/nodePositions.json")
const server = require("../../src/server")
const { getNodePositionByNodeName } = require("../../src/getData")
const {
  insertExperiment,
  insertPoints
} = require("../../src/storeData/index")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")

describe("Server for node positions", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all node positions on get at /node-positions", async () => {
    await NodePosition.bulkCreate(nodePositions)
    const result = await rest.get(
      "http://localhost:3000/experiments/test-experiment/node-positions"
    )
    expect(result.response.statusCode).to.equal(200)
    expect(sortBy(result.data, ["localizedNodeId"]))
      .to.deep.equal(sortBy(nodePositions, ["localizedNodeId"]))
  })

  it("should return node position data on get at /node-positions/node-name", async () => {
    await NodePosition.bulkCreate(nodePositions)
    const result = await rest.get(
      "http://localhost:3000/experiments/test-experiment/node-positions/Node2"
    )
    expect(result.response.statusCode).to.equal(200)
    expect(result.data).to.deep.equal(nodePositions[1])
  })

  it("should return node position name in body and path in location header on single post at" +
    " /node-positions",
    async () => {
      const result = await rest.post(
        "http://localhost:3000/experiments/test-experiment/node-positions",
        { data: omit(nodePositions[1], ["experimentName"]) }
      )
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location)
        .to.equal("/experiments/test-experiment/node-positions/Node2")
      expect(result.data).to.equal("Node2")
    }
  )

  it("should store the node position in the database on single post at /node-positions",
    async () => {
      const result = await rest.post(
        "http://localhost:3000/experiments/test-experiment/node-positions",
        { data: omit(nodePositions[1], ["experimentName"]) }
      )
      expect(result.response.statusCode).to.equal(201)
      const storedPoints = await NodePosition.findAll()
      expect(pick(storedPoints[0], keys(nodePositions[1])))
        .to.deep.equal(nodePositions[1])
    }
  )

  it("should update the node position in the database on single post at /node-positions",
    async () => {
      await NodePosition.create(nodePositions[1])
      const updatedNodePosition = {
        localizedNodeName: "Node2",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      const result = await rest.post(
        "http://localhost:3000/experiments/test-experiment/node-positions",
        { data: omit(updatedNodePosition, ["experimentName"]) }
      )
      expect(result.response.statusCode).to.equal(201)
      const storedPoints = await NodePosition.findAll()
      expect(storedPoints.length).to.equal(1)
      expect(pick(storedPoints[0], keys(nodePositions[1]))).to.deep.equal(updatedNodePosition)
    }
  )

  it("should return node position names in body and paths in location header on multiple post at" +
    " /node-positions",
    async () => {
      const result = await rest.post(
        "http://localhost:3000/experiments/test-experiment/node-positions",
        { data: nodePositions.map(nodePosition => omit(nodePosition, ["experimentName"])) }
      )
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location)
        .to.equal(
        nodePositions
          .map(nodePosition =>
            `/experiments/test-experiment/node-positions/${nodePosition.localizedNodeName}`
          ).join("; ")
      )
      expect(result.data)
        .to.deep.equal(nodePositions.map(nodePosition => nodePosition.localizedNodeName))
    }
  )

  it("should store the node positions in the database on multiple post at " +
    "/node-positions",
    async () => {
      const result = await rest.post(
        "http://localhost:3000/experiments/test-experiment/node-positions",
        { data: nodePositions.map(nodePosition => omit(nodePosition, ["experimentName"])) }
      )
      expect(result.response.statusCode).to.equal(201)
      const storedNodePositionsQueryResult = await NodePosition.findAll()
      const storedNodePosition = storedNodePositionsQueryResult
        .map(nodePosition => pick(nodePosition, keys(nodePositions[0])))
      expect(sortBy(storedNodePosition, ["localizedNodeName"]))
        .to.deep.equal(sortBy(nodePositions, ["localizedNodeName"]))
    }
  )

  it("should update the node positions in the database on multiple post at " +
    "/node-positions",
    async () => {
      const updatedNodePositions = [
        {
          localizedNodeName: "Node1",
          pointName: "point2",
          experimentName: "test-experiment"
        },
        {
          localizedNodeName: "Node2",
          pointName: "point3",
          experimentName: "test-experiment"
        },
        {
          localizedNodeName: "Node3",
          pointName: "point1",
          experimentName: "test-experiment"
        }
      ]
      await NodePosition.bulkCreate(nodePositions)
      const result = await rest.post(
        "http://localhost:3000/experiments/test-experiment/node-positions",
        { data: updatedNodePositions.map(nodePosition => omit(nodePosition, ["experimentName"])) }
      )
      expect(result.response.statusCode).to.equal(201)
      const storedNodePositionsQueryResult = await NodePosition.findAll()
      const storedNodePosition = storedNodePositionsQueryResult
        .map(nodePosition => pick(nodePosition, keys(nodePositions[0])))
      expect(sortBy(storedNodePosition, ["localizedNodeName"]))
        .to.deep.equal(sortBy(updatedNodePositions, ["localizedNodeName"]))
    }
  )

  it("should return the node name corresponding to the deleted node position on DELETE at " +
    "/node-positions/node-name",
    async () => {
      await NodePosition.bulkCreate(nodePositions)

      const result = await rest.del(
        "http://localhost:3000/experiments/test-experiment/node-positions/Node1"
      )

      expect(result.data).to.equal("Node1")
      expect(result.response.statusCode).to.equal(200)
    }
  )

  it(
    "should delete the node position corresponding to the node on DELETE at " +
    "/node-positions/node-name",
    async () => {
      await NodePosition.bulkCreate(nodePositions)
      const initialNode1 = await getNodePositionByNodeName("Node1", "test-experiment")
      expect(initialNode1.localizedNodeName).to.equal("Node1")

      await rest.del(
        "http://localhost:3000/experiments/test-experiment/node-positions/Node1"
      )

      const node1 = await getNodePositionByNodeName("Node1", "test-experiment")

      expect(node1).to.equal(undefined)
    }
  )
})
