const { describe, it, before, after } = require("mocha")
const { expect, assert } = require("chai")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")


describe("Model Experiment", () => {
  before((done) => {
    dbSync().then(done).catch(done)
  })

  after((done) => {
    dbDrop().then(done).catch(done)
  })

  it("can create an experiment", done => {
    Experiment.create({ name: "test-experiment" })
      .then(() => {
        Experiment.findAll().then(experiments => {
          expect(experiments[0].name).to.equal("test-experiment")
        })
        done()
      }).catch(done)
  })

  it("raises an error when the experiment name already exists", async () => {
    try {
      await Experiment.bulkCreate(
        [
          { name: "test-experiment" },
          { name: "test-experiment" }
        ]
      )
      assert.fail("", "Validation error", "No error was thrown")
    } catch (error) {
      expect(error.message).to.equal("Validation error")
    }
  })
})
