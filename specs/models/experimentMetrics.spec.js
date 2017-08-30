const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { keys, omit } = require("lodash")
// const { checkPrimaryMetrics } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")


describe("Model ExperimentMetrics", () => {
  before(async () => {
    await dbSync()
    await Experiment.create({ name: "test-experiment" })
    await ExperimentMetrics.create(experimentPrimaryMetrics)
  })

  after(async () => {
    await dbDrop()
  })

  it("can create experiment metrics", async () => {
    const experimentMetrics = await ExperimentMetrics.findAll({
      where: { experimentName: "test-experiment" },
      include: { model: Experiment }
    })
    checkPrimaryMetrics(experimentMetrics)
  })
})

function checkPrimaryMetrics(queryResult) {
  expect(queryResult[0].experiment.name).to.equal("test-experiment")
  for (const key of keys(omit(experimentPrimaryMetrics, "experimentName"))) {
    expect(queryResult[0][key])
      .to.be.closeTo(
      experimentPrimaryMetrics[key],
      0.0000000000001,
      key
    )
  }
}
