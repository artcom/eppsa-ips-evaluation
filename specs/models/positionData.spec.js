const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { sortBy, pick } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
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
      { include: [{ model: Point }] }
    )
    expect(sortBy(storedPositions.map(position => ({
      localizedNodeId: position.localizedNodeId,
      pointName: position.pointName
    })), "localizedNodeId"))
      .to.deep.equal(sortBy(positionData.map(positionDatum =>
      pick(positionDatum, ["pointName", "localizedNodeId"])), "localizedNodeId")
    )
  })
})

async function createPositionData() {
  await Experiment.create({ name: "test-experiment" })
  await Point.bulkCreate(points)
  await PositionData.bulkCreate(positionData)
}
