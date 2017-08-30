const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const rest = require("restling")
const { keys, pick, sortBy } = require("lodash")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const { dbSync, dbDrop } = require("../helpers/db")
const server = require("../../src/server")


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

  it("should return node data on get at /nodes/node-id", async () => {
    await Node.bulkCreate(nodes)
    const result = await rest.get("http://localhost:3000/nodes/node2")
    expect(result.response.statusCode).to.equal(200)
    expect(result.data[0]).to.deep.equal(nodes[1])
  })

  it("should return node id in body and path in location header on single node post at /nodes",
    async () => {
      const result = await rest.post("http://localhost:3000/nodes", { data: nodes[1] })
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location).to.equal("/nodes/node2")
      expect(result.data).to.equal("node2")
    }
  )

  it("should store the node in the database on single node post at /nodes", async () => {
    const result = await rest.post("http://localhost:3000/nodes", { data: nodes[1] })
    expect(result.response.statusCode).to.equal(201)
    const storedNodes = await Node.findAll()
    expect(pick(storedNodes[0], keys(nodes[1]))).to.deep.equal(nodes[1])
  })

  it("should return node names in body and paths in location header on multiple node post at " +
    "/nodes/bulk",
    async () => {
      const result = await rest.post("http://localhost:3000/nodes/bulk", { data: nodes })
      expect(result.response.statusCode).to.equal(201)
      expect(result.response.headers.location).to.equal(
        "/nodes/node1; " +
        "/nodes/node2; " +
        "/nodes/node3"
      )
      expect(result.data).to.deep.equal([
        "node1",
        "node2",
        "node3"
      ])
    }
  )

  it("should store the nodes in the database on multiple node post at /nodes/bulk", async () => {
    const result = await rest.post("http://localhost:3000/nodes/bulk", { data: nodes })
    expect(result.response.statusCode).to.equal(201)
    const storedNodesQueryResult = await Node.findAll()
    const storedNodes = storedNodesQueryResult.map(node => pick(node, keys(nodes[0])))
    expect(storedNodes).to.deep.equal(nodes)
  })
})
