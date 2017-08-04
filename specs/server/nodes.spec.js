const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
const { keys, pick, sortBy } = require("lodash")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const { dbSync, dbDrop } = require("../helpers/db")
const server = require("../../src/server")
const { insertNodes } = require("../../src/storeData/index")

describe("Server for nodes", () => {
  beforeEach(async () => {
    await dbSync()
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all nodes on get at /nodes", done => {
    insertNodes(nodes).then(() => {
      restler.get("http://localhost:3000/nodes").on("complete", (data, response) => {
        expect(response.statusCode).to.equal(200)
        expect(sortBy(data, ["id"])).to.deep.equal(sortBy(nodes, ["id"]))
        done()
      })
    })
  })

  it("should return node data on get at /nodes/node-id", done => {
    insertNodes(nodes).then(() => {
      restler.get("http://localhost:3000/nodes/20914830ce00")
        .on("complete", (data, response) => {
          expect(response.statusCode).to.equal(200)
          expect(data[0]).to.deep.equal(nodes[1])
          done()
        })
    })
  })

  it("should return node id in body and path in location header on single node post at /nodes",
    done => {
      restler.post("http://localhost:3000/nodes", {
        data: nodes[1]
      }).on("complete", (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(response.headers.location).to.equal("/nodes/20914830ce00")
        expect(data).to.equal("20914830ce00")
        done()
      })
    }
  )

  it("should store the node in the database on single node post at /nodes", done => {
    restler.post("http://localhost:3000/nodes", {
      data: nodes[1]
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const storedNodes = await Node.findAll()
      expect(pick(storedNodes[0], keys(nodes[1]))).to.deep.equal(nodes[1])
      done()
    })
  })

  it("should return node names in body and paths in location header on multiple node post at " +
    "/nodes/bulk",
    done => {
      restler.post("http://localhost:3000/nodes/bulk", {
        data: nodes
      }).on("complete", (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(response.headers.location).to.equal(
          "/nodes/20914830f65a; " +
          "/nodes/20914830ce00; " +
          "/nodes/6655443322dd; " +
          "/nodes/665544332211; " +
          "/nodes/665544332266; " +
          "/nodes/e0e5cfb58d13"
        )
        expect(data).to.deep.equal([
          "20914830f65a",
          "20914830ce00",
          "6655443322dd",
          "665544332211",
          "665544332266",
          "e0e5cfb58d13"
        ])
        done()
      })
    }
  )

  it("should store the nodes in the database on multiple node post at /nodes/bulk", done => {
    restler.post("http://localhost:3000/nodes/bulk", {
      data: nodes
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const storedNodesQueryResult = await Node.findAll()
      const storedNodes = storedNodesQueryResult.map(node => pick(node, keys(nodes[0])))
      expect(storedNodes).to.deep.equal(nodes)
      done()
    })
  })
})
