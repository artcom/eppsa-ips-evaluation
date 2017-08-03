const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const nodePositions = require("../testData/nodePositions.json")
const NodePosition = require("../../src/models/nodePosition")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")


describe("Model NodePosition", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
  })

  describe("Model NodePosition basic function", () => {
    it("can create node positions", async () => {
      await Experiment.create({ name: "test-experiment" })
      await Point.bulkCreate(points)
      await NodePosition.bulkCreate(nodePositions)
      const storedPositions = await NodePosition.findAll({ include: { model: Experiment } })
      const storedNodePositions = storedPositions
        .map(storedPosition => pick(storedPosition, keys(nodePositions[0])))
      for (const position of storedPositions) {
        expect(position.experiment.name).to.equal("test-experiment")
      }
      expect(sortBy(storedNodePositions, ["localizedNodeId"]))
    })
  })
})
