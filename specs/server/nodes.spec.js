const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const rest = require("restling")
const { assign, keys, pick, set, sortBy } = require("lodash")
const { getNodeByName } = require("../../src/getData")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const positionsWithErrors = require("../testData/positionsWithErrors.json")
const { dbSync, dbDrop } = require("../helpers/db")
const server = require("../../src/server")
const { insertExperiment, insertPoints, insertPositionData } = require("../../src/storeData/index")


describe("Server for nodes", () => {
  beforeEach(async () => {
    await dbSync()
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all nodes on get at /nodes", async () => {
    await Node.bulkCreate(nodes)
    const result = await rest.get("http://localhost:3000/nodes")
    expect(result.response.statusCode).to.equal(200)
    expect(sortBy(result.data, ["id"])).to.deep.equal(sortBy(nodes, ["id"]))
  })

  it("should return node data on get at /nodes/node-name", async () => {
    await Node.bulkCreate(nodes)
    const result = await rest.get("http://localhost:3000/nodes/Node2")
    expect(result.response.statusCode).to.equal(200)
    expect(result.data).to.deep.equal(nodes[1])
  })

  it("should return node name in body and path in location header on single node post at /nodes",
    async () => {
      const result = await rest.post("http://localhost:3000/nodes", { data: nodes[1] })
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location).to.equal("/nodes/Node2")
      expect(result.data).to.equal("Node2")
    }
  )

  it("should store the node in the database on single node post at /nodes", async () => {
    const result = await rest.post("http://localhost:3000/nodes", { data: nodes[1] })
    expect(result.response.statusCode).to.equal(201)
    const storedNodes = await Node.findAll()
    expect(pick(storedNodes[0], keys(nodes[1]))).to.deep.equal(nodes[1])
  })

  it("should return node names in body and paths in location header on multiple node post at " +
    "/nodes",
    async () => {
      const result = await rest.post("http://localhost:3000/nodes", { data: nodes })
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location).to.equal(
        "/nodes/Node1; " +
        "/nodes/Node2; " +
        "/nodes/Node3"
      )
      expect(result.data).to.deep.equal([
        "Node1",
        "Node2",
        "Node3"
      ])
    }
  )

  it("should store the nodes in the database on multiple node post at /nodes", async () => {
    const result = await rest.post("http://localhost:3000/nodes", { data: nodes })
    expect(result.response.statusCode).to.equal(201)
    const storedNodesQueryResult = await Node.findAll()
    const storedNodes = storedNodesQueryResult.map(node => pick(node, keys(nodes[0])))
    expect(storedNodes).to.deep.equal(nodes)
  })

  it("should return the deleted node name on DELETE at /nodes/node-name",
    async () => {
      await Node.bulkCreate(nodes)

      const result = await rest.del("http://localhost:3000/nodes/Node1")

      expect(result.data).to.equal("Node1")
      expect(result.response.statusCode).to.equal(200)
    }
  )

  it(
    "should delete a node on DELETE at /nodes/node-name",
    async () => {
      await Node.bulkCreate(nodes)

      await rest.del("http://localhost:3000/nodes/Node1")

      const node1 = await getNodeByName("Node1")

      expect(node1).to.equal(undefined)
    }
  )

  it("should not delete a node when it has experimental data associated with it", async () => {
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await insertExperiment("test-experiment")
    await insertPositionData(
      positionsWithErrors.map(position =>
        set(assign({}, position), "experimentName", "test-experiment")
      )
    )

    const result = await rest.del("http://localhost:3000/nodes/Node1")

    const node1 = await getNodeByName("Node1")
    expect(result.data)
      .to.equal("Node \"Node1\" has associated experimental data and was not deleted")

    expect(JSON.stringify(node1)).to.equal(JSON.stringify(nodes[0]))
  })
})
