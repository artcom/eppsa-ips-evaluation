const { describe, it, before, after } = require("mocha")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positionData = require("../testData/positionData.json")
const storePositionData = require("../../src/storeData/storePositionData")
const { checkPositionData } = require("../helpers/data")


describe("storePositionData", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
  })

  it("can create position data", async () => {
    await Experiment.create({ name: "test-experiment" })
    await Point.bulkCreate(points)
    await Node.bulkCreate(nodes)
    await storePositionData(positionData)
    const queryResults = await PositionData.findAll()
    checkPositionData(queryResults)
  })
})
