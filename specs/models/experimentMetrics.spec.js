const { describe, it, before, after } = require("mocha")
const { checkPrimaryMetrics } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")


describe("Model ExperimentMetrics", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
  })

  describe("Model ExperimentMetrics basic function", () => {
    it("can create experiment metrics", async () => {
      await Experiment.create({ name: "test-experiment" })
      await ExperimentMetrics.create(experimentPrimaryMetrics)
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      checkPrimaryMetrics({ experimentMetrics })
    })
  })
})
