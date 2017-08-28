const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Node = require("../../src/models/node")
const nodePositions = require("../testData/nodePositions.json")
const NodePosition = require("../../src/models/nodePosition")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")


describe("Model NodePosition", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  it("can create node positions", async () => {
    await createNodePosition()
    const storedPositions = await NodePosition.findAll({ include: [{ model: Experiment }] })
    const storedNodePositions = storedPositions
      .map(storedPosition => pick(storedPosition, keys(nodePositions[0])))
    expect(sortBy(storedNodePositions, ["localizedNodeId"]))
      .to.deep.equal(sortBy(nodePositions, ["localizedNodeId"]))
  })

  it("has a one to one relationship with Experiment", async () => {
    await createNodePosition()
    const storedPositions = await NodePosition.findAll({ include: [{ model: Experiment }] })
    for (const position of storedPositions) {
      expect(position.experiment.name).to.equal("test-experiment")
    }
  })

  it("has a one to one relationship with Node", async () => {
    await createNodePosition()
    const storedPositions = await NodePosition.findAll(
      { include: [{ model: Node, as: "localizedNode" }] }
    )
    expect(storedPositions.map(position => pick(position.localizedNode, keys(nodes[0]))))
      .to.deep.equal(nodes)
  })

  it("has a one to one relationship with Point", async () => {
    await createNodePosition()
    const storedPositions = await NodePosition.findAll(
      {
        include: [
          { model: Point },
          { model: Node, as: "localizedNode" }
        ]
      }
    )
    expect(sortBy(storedPositions.map(position => ({
      localizedNodeId: position.localizedNode.id,
      pointName: position.pointName
    })), "localizedNodeId"))
      .to.deep.equal(sortBy(nodePositions.map(nodePosition =>
        pick(nodePosition, ["pointName", "localizedNodeId"])), "localizedNodeId")
      )
  })
})

async function createNodePosition() {
  await Experiment.create({ name: "test-experiment" })
  await Point.bulkCreate(points)
  await Node.bulkCreate(nodes)
  await NodePosition.bulkCreate(nodePositions)
}
