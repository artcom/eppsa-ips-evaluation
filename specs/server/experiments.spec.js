const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
const Experiment = require("../../src/models/experiment")
const { dbSync, dbDrop } = require("../helpers/db")
const { insertExperiment } = require("../../src/storeData/index")
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

  it("should return 200 at /", done => {
    restler.get("http://localhost:3000").on("complete", (data, response) => {
      expect(response.statusCode).to.equal(200)
      expect(data).to.equal("")
      done()
    })
  })

  it("should return all experiments on get at /experiments", done => {
    insertExperiment("test-experiment").then(() => {
      restler.get("http://localhost:3000/experiments").on("complete", (data, response) => {
        expect(response.statusCode).to.equal(200)
        expect(data).to.deep.equal([{ name: "test-experiment" }])
        done()
      })
    })
  })

  it("should return experiment name on get at /experiments/experiment-name", done => {
    insertExperiment("test-experiment").then(() => {
      restler.get("http://localhost:3000/experiments/test-experiment")
        .on("complete", (data, response) => {
          expect(response.statusCode).to.equal(200)
          expect(data).to.deep.equal({ name: "test-experiment" })
          done()
        })
    })
  })

  it("should return experiment name in body and path in location header on post at /experiments",
      done => {
        restler.post("http://localhost:3000/experiments", {
          data: { name: "test-experiment" }
        }).on("complete", (data, response) => {
          expect(response.statusCode).to.equal(201)
          expect(response.headers.location).to.equal("/experiments/test-experiment")
          expect(data).to.equal("test-experiment")
          done()
        })
      }
  )

  it("should store the experiment in the database on post at /experiments", done => {
    restler.post("http://localhost:3000/experiments", {
      data: { name: "test-experiment" }
    }).on("complete", async (data, response) => {
      expect(response.statusCode).to.equal(201)
      const experiments = await Experiment.findAll()
      expect(experiments[0].name).to.equal("test-experiment")
      done()
    })
  })

  it("should run an experiment on post at /experiment/run", done => {
    insertExperiment("test-experiment").then(() => {
      restler.post("http://localhost:3000/experiments/test-experiment/run", {
        data: { experimentTypes: ["Quuppa"], repeats: 2, interval: 1000 }
      }).on("complete", async (data, response) => {
        expect(response.statusCode).to.equal(201)
        expect(data).to.equal("started Quuppa experiment")
        done()
      })
    })
  })
})
