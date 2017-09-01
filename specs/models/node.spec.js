const { describe, it, before, after } = require("mocha")
const { expect, assert } = require("chai")
const { keys, merge, omit, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")


describe("Model Node", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
  })

  describe("Model Point basic function", () => {
    it("can create points", async () => {
      await Node.bulkCreate(nodes)
      const queryResults = await Node.findAll()
      const storedNodes = queryResults
        .map(queryResult => pick(queryResult, keys(nodes[0])))
      expect(sortBy(storedNodes, ["id"]))
        .to.deep.equal(sortBy(nodes, ["id"]))
    })

    it("raises an error when the node name already exists", async () => {
      try {
        await Node.bulkCreate(
          [
            nodes[0],
            merge({ name: "Node1" }, omit(nodes[1], "name"))
          ]
        )
        assert.fail("", "Validation error", "No error was thrown")
      } catch (error) {
        expect(error.message).to.equal("Validation error")
      }
    })
  })
})
