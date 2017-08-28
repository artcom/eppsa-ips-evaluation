const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { sortBy, pick, keys, slice } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positionData = require("../testData/positionData.json")
const { checkPositionData } = require("../helpers/data")


describe("Model PositionData", () => {
  beforeEach((done) => {
    dbSync().then(done).catch(done)
  })

  afterEach((done) => {
    dbDrop().then(done).catch(done)
  })

  it("can create position data", async () => {
    await createPositionData()
    const queryResults = await PositionData.findAll()
    checkPositionData(queryResults)
  })

  it("has a one to one relationship with Experiment", async () => {
    await createPositionData()
    const storedPositions = await PositionData.findAll({ include: [{ model: Experiment }] })
    for (const position of storedPositions) {
      expect(position.experiment.name).to.equal("test-experiment")
    }
  })

  it("has a one to one relationship with Point", async () => {
    await createPositionData()
    const storedPositions = await PositionData.findAll(
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
      .to.deep.equal(sortBy(positionData.map(positionDatum =>
      pick(positionDatum, ["pointName", "localizedNodeId"])), "localizedNodeId")
    )
  })

  it("has a one to one relationship with Node", async () => {
    await createPositionData()
    const storedPositions = await PositionData.findAll(
      { include: [{ model: Node, as: "localizedNode" }] }
    )
    expect(storedPositions.map(position => pick(position.localizedNode, keys(nodes[0]))))
      .to.deep.equal(slice(nodes, 0, 3))
  })
})

async function createPositionData() {
  await Experiment.create({ name: "test-experiment" })
  await Point.bulkCreate(points)
  await Node.bulkCreate(nodes)
  await PositionData.bulkCreate(positionData)
}
