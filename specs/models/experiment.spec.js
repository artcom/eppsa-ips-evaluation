const { describe, it, before, after } = require("mocha")
const { expect, assert } = require("chai")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")


describe("Model Experiment", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
  })

  it("can create an experiment", async () => {
    await Experiment.create({ name: "test-experiment" })
    const experiments = await Experiment.findAll()
    expect(experiments[0].name).to.equal("test-experiment")
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
