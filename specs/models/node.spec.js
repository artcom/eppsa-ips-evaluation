const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
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
  })
})
