const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, includes, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Node = require("../../src/models/node")
const nodePositions = require("../testData/nodePositions.json")
const NodePosition = require("../../src/models/nodePosition")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const { insertExperiment, insertPoints } = require("../../src/storeData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Model NodePosition", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await NodePosition.bulkCreate(nodePositions)
  })

  afterEach(async () => {
    await dbDrop()
  })

  it("can create node positions", async () => {
    const storedPositions = await NodePosition.findAll({ include: [{ model: Experiment }] })
    const storedNodePositions = storedPositions
      .map(storedPosition => pick(storedPosition, keys(nodePositions[0])))
    expect(sortBy(storedNodePositions, ["localizedNodeName"]))
      .to.deep.equal(sortBy(nodePositions, ["localizedNodeName"]))
  })

  it("removes node positions with no associated node", async () => {
    await Node.destroy({ where: { name: "Node1" } })
    const remainingNodePositions = await NodePosition
      .findAll({ where: { experimentName: "test-experiment" } })
    const associatedNodes = remainingNodePositions.map(position =>
      position.localizedNodeName != null
    )
    expect(includes(associatedNodes, false)).to.equal(false)
  })

  it("removes node positions with no associated point", async () => {
    await Point.destroy({ where: { name: "point1" } })
    const remainingNodePositions = await NodePosition
      .findAll({ where: { experimentName: "test-experiment" } })
    const associatedPoints = remainingNodePositions.map(position =>
      position.pointName != null
    )
    expect(includes(associatedPoints, false)).to.equal(false)
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
    expect(storedPositions.map(position => pick(position.localizedNode, keys(nodes[0]))))
      .to.deep.equal(nodes)
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
      localizedNodeName: position.localizedNode.name,
      pointName: position.pointName
    })), "localizedNodeName"))
      .to.deep.equal(sortBy(nodePositions.map(nodePosition =>
        pick(nodePosition, ["pointName", "localizedNodeName"])), "localizedNodeName")
      )
  })
})
