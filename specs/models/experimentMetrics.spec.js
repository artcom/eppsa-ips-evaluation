const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { keys, omit } = require("lodash")
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

  describe("Create experiment", () => {
    it("can create an experiment", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => {
          ExperimentMetrics.create(experimentPrimaryMetrics)
            .then(() => {
              ExperimentMetrics.findAll({
                where: { experimentName: "test-experiment" },
                include: { model: Experiment }
              })
                .then(experimentMetrics => {
                  expect(experimentMetrics[0].experimentName).to.equal("test-experiment")
                  for (const key of keys(omit(experimentPrimaryMetrics, ["experimentName"]))) {
                    expect(experimentMetrics[0][key])
                      .to.be.closeTo(experimentPrimaryMetrics[key], 0.0000000000001)
                  }
                  expect(experimentMetrics[0].experiment.name).to.equal("test-experiment")
                  done()
                })
            }).catch(done)
        })
    })
  })
})
