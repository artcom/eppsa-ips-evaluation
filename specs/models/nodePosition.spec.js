const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Node = require("../../src/models/node")
const nodePositions = require("../testData/nodePositions.json")
const nodePositionsSimple = require("../testData/nodePositionsSimple.json")
const NodePosition = require("../../src/models/nodePosition")
const nodesSimple = require("../testData/nodesSimple.json")
const Point = require("../../src/models/point")
const pointsSimple = require("../testData/pointsSimple.json")
const { insertExperiment, insertPoints } = require("../../src/storeData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Model NodePosition", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(pointsSimple)
    await Node.bulkCreate(nodesSimple)
    await NodePosition.bulkCreate(nodePositionsSimple)
  })

  afterEach(async () => {
    await dbDrop()
  })

  it("can create node positions", async () => {
    const storedPositions = await NodePosition.findAll({ include: [{ model: Experiment }] })
    const storedNodePositions = storedPositions
      .map(storedPosition => pick(storedPosition, keys(nodePositions[0])))
    expect(sortBy(storedNodePositions, ["localizedNodeId"]))
      .to.deep.equal(sortBy(nodePositionsSimple, ["localizedNodeId"]))
  })

  it("has a one to one relationship with Experiment", async () => {
    const storedPositions = await NodePosition.findAll({ include: [{ model: Experiment }] })
    for (const position of storedPositions) {
      expect(position.experiment.name).to.equal("test-experiment")
    }
  })

  it("has a one to one relationship with Node", async () => {
    const storedPositions = await NodePosition.findAll(
      { include: [{ model: Node, as: "localizedNode" }] }
    )
    expect(storedPositions.map(position => pick(position.localizedNode, keys(nodesSimple[0]))))
      .to.deep.equal(nodesSimple)
  })

  it("has a one to one relationship with Point", async () => {
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
      .to.deep.equal(sortBy(nodePositionsSimple.map(nodePosition =>
        pick(nodePosition, ["pointName", "localizedNodeId"])), "localizedNodeId")
      )
  })
})
