const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
const { keys, omit, pick, sortBy } = require("lodash")
const NodePosition = require("../../src/models/nodePosition")
const { dbSync, dbDrop } = require("../helpers/db")
const nodePositions = require("../testData/nodePositions.json")
const server = require("../../src/server")
const { insertNodePositions, insertExperiment } = require("../../src/storeData/index")

describe("Server for points", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all node positions on get at /node-positions", done => {
    insertNodePositions(nodePositions).then(() => {
      restler.get("http://localhost:3000/experiments/test-experiment/node-positions")
        .on("complete", (data, response) => {
          expect(response.statusCode).to.equal(200)
          expect(sortBy(data, ["localizedNodeId"]))
            .to.deep.equal(sortBy(nodePositions, ["localizedNodeId"]))
          done()
        })
    })
  })

  it("should return node position data on get at /node-positions/node-id", done => {
    insertNodePositions(nodePositions).then(() => {
      restler.get(
        "http://localhost:3000/experiments/test-experiment/node-positions/20914830ce00"
      )
        .on("complete", (data, response) => {
          expect(response.statusCode).to.equal(200)
          expect(data[0]).to.deep.equal(nodePositions[1])
          done()
        })
    })
  })

  it("should return node position name in body and path in location header on single post at" +
    " /node-positions",
    done => {
      restler.post("http://localhost:3000/experiments/test-experiment/node-positions", {
        data: omit(nodePositions[1], ["experimentName"])
      }).on("complete", (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(response.headers.location)
          .to.equal("/experiments/test-experiment/node-positions/20914830ce00")
        expect(data).to.equal("20914830ce00")
        done()
      })
    }
  )

  it("should store the node position in the database on single post at /node-positions", done => {
    restler.post("http://localhost:3000/experiments/test-experiment/node-positions", {
      data: omit(nodePositions[1], ["experimentName"])
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const storedPoints = await NodePosition.findAll()
      expect(pick(storedPoints[0], keys(nodePositions[1]))).to.deep.equal(nodePositions[1])
      done()
    })
  })

  it("should return node position names in body and paths in location header on multiple post at" +
    " /node-positions/bulk",
    done => {
      restler.post(
        "http://localhost:3000/experiments/test-experiment/node-positions/bulk",
        {
          data: nodePositions.map(nodePosition => omit(nodePosition, ["experimentName"]))
        }
      ).on("complete", (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(response.headers.location)
          .to.equal(
          nodePositions
            .map(nodePosition =>
              `/experiments/test-experiment/node-positions/${nodePosition.localizedNodeId}`
            ).join("; ")
        )
        expect(data)
          .to.deep.equal(nodePositions.map(nodePosition => nodePosition.localizedNodeId))
        done()
      })
    }
  )

  it("should store the node positions in the database on multiple post at " +
    "/node-positions/bulk",
    done => {
      restler.post(
        "http://localhost:3000/experiments/test-experiment/node-positions/bulk",
        {
          data: nodePositions.map(nodePosition => omit(nodePosition, ["experimentName"]))
        }
      ).on("complete", async (data, response) => {
        expect(response.statusCode).to.equal(201)
        const storedNodePositionsQueryResult = await NodePosition.findAll()
        const storedNodePosition = storedNodePositionsQueryResult
          .map(nodePosition => pick(nodePosition, keys(nodePositions[0])))
        expect(storedNodePosition).to.deep.equal(nodePositions)
        done()
      })
    }
  )
})