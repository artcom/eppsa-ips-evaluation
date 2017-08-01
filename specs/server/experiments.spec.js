const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
const Experiment = require("../../src/models/experiment")
const { dbSync, dbDrop } = require("../helpers/db")
const { setUpExperiment } = require("../../src/setUpExperiment")
const server = require("../../src/server")

describe("Server for experiments", () => {
  beforeEach(async () => {
    await dbSync()
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return 200 at /", async () => {
    await restler.get("http://localhost:3000").on("complete", (data, response) => {
      expect(response.statusCode).to.equal(200)
      expect(data).to.equal("")
    })
  })

  it("should return all experiments on get at /experiments", async () => {
    await setUpExperiment("test-experiment")
    await restler.get("http://localhost:3000/experiments").on("complete", (data, response) => {
      expect(response.statusCode).to.equal(200)
      expect(data).to.deep.equal([{ name: "test-experiment" }])
    })
  })

  it("should return experiment name on get at /experiments/experiment-name", async () => {
    await setUpExperiment("test-experiment")
    await restler.get("http://localhost:3000/experiments/test-experiment")
      .on("complete", (data, response) => {
        expect(response.statusCode).to.equal(200)
        expect(data).to.deep.equal({ name: "test-experiment" })
      })
  })

  it("should return experiment name in body and path in location header on post at /experiments",
      async () => {
        await restler.post("http://localhost:3000/experiments", {
          data: { name: "test-experiment" }
        }).on("complete", (data, response) => {
          expect(response.statusCode).to.equal(201)
          expect(response.headers.location).to.equal("/experiments/test-experiment")
          expect(data).to.equal("test-experiment")
        })
      }
  )

  it("should store the experiment in the database on post at /experiments", async () => {
    await restler.post("http://localhost:3000/experiments", {
      data: { name: "test-experiment" }
    }).on("complete", (data, response) => {
      expect(response.statusCode).to.equal(201)
      Experiment.findAll().then(experiments => {
        expect(experiments[0].name).to.equal("test-experiment")
      })
    })
  })
})
