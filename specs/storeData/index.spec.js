const { describe, it, beforeEach, afterEach } = require("mocha")
const { checkPrimaryMetrics } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const { insertPrimaryMetrics } = require("../../src/storeData")


describe("Process experimental data", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("insertPrimaryMetrics basic function", () => {
    it("stores experiment metrics", async () => {
      await Experiment.create({ name: "test-experiment" })
      await insertPrimaryMetrics(experimentPrimaryMetrics)
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      checkPrimaryMetrics(experimentMetrics)
    })
  })
})
