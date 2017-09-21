const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { sortBy, pick, find, keys, slice } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positionData = require("../testData/positionsWithZones.json")
const { insertPoints } = require("../../src/storeData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones")


describe("Model PositionData", () => {
  beforeEach(async () => {
    await dbSync()
    await Experiment.create({ name: "test-experiment" })
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await PositionData.bulkCreate(positionData)
  })

  afterEach(async () => {
    await dbDrop()
  })

  it("can create position data", async () => {
    const queryResults = await PositionData.findAll()
    checkPositions(queryResults)
  })

  it("has a one to one relationship with Experiment", async () => {
    const storedPositions = await PositionData.findAll({ include: [{ model: Experiment }] })
    for (const position of storedPositions) {
      expect(position.experiment.name).to.equal("test-experiment")
    }
  })

  it("sets default value for Z coordinate", async () => {
    const newPosition = {
      pointName: "point2",
      experimentName: "test-experiment",
      localizedNodeName: "Node3",
      estCoordinateX: 3.3,
      estCoordinateY: 4.2,
      estZoneLabel: "zone1"
    }
    await PositionData.create(newPosition)
    const queryResults = await PositionData.findAll()
    const defaultZ = find(queryResults.map(queryResult =>
      pick(queryResult, ["estCoordinateZ"])
    ), { estCoordinateZ: 1.2 })
    expect(defaultZ != null).to.equal(true)
  })

  it("has a one to one relationship with Point", async () => {
    const storedPositions = await PositionData.findAll(
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
      .to.deep.equal(sortBy(positionData.map(positionDatum =>
      pick(positionDatum, ["pointName", "localizedNodeName"])), "localizedNodeName")
    )
  })

  it("has a one to one relationship with Node", async () => {
    const storedPositions = await PositionData.findAll(
      { include: [{ model: Node, as: "localizedNode" }] }
    )
    expect(storedPositions.map(position => pick(position.localizedNode, keys(nodes[0]))))
      .to.deep.equal(slice(nodes, 0, 3))
  })
})

function checkPositions(queryResults) {
  const storedPositionData = queryResults
    .map(queryResult =>
      pick(queryResult, keys(positionData[0]))
    )
  expect(sortBy(storedPositionData, ["pointName"]))
    .to.deep.equal(sortBy(positionData, ["pointName"]))
}
