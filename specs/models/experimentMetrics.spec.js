const { describe, it, before, after } = require("mocha")
const { checkPrimaryMetrics } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")


describe("Model ExperimentMetrics", () => {
  before((done) => {
    dbSync().then(done).catch(done)
  })

  after((done) => {
    dbDrop().then(done).catch(done)
  })

  describe("Model ExperimentMetrics basic function", () => {
    it("can create experiment metrics", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => {
          ExperimentMetrics.create(experimentPrimaryMetrics)
            .then(() => {
              ExperimentMetrics.findAll({
                where: { experimentName: "test-experiment" },
                include: { model: Experiment }
              })
                .then(experimentMetrics => {
                  checkPrimaryMetrics({ experimentMetrics })
                  done()
                }).catch(done)
            }).catch(done)
        }).catch(done)
    })
  })
})
