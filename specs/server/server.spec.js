const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const request = require("request")
const restler = require("restler")
const { dbSync, dbDrop } = require("../helpers/db")
const { setUpExperiment } = require("../../src/setUpExperiment")
const server = require("../../src/server")

describe("Server response", () => {
  beforeEach((done) => {
    dbSync().then(done).catch(done)
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach((done) => {
    dbDrop().then(done).catch(done)
    this.server.close()
  })

  it("should return 200 at /", done => {
    request.get("http://localhost:3000", (err, res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.equal("")
      done()
    })
  })

  it("should return all experiments on get at /experiments", done => {
    setUpExperiment("test-experiment")
    request.get("http://localhost:3000/experiments", (err, res) => {
      expect(res.statusCode).to.equal(200)
      expect(JSON.parse(res.body)).to.deep.equal([{ name: "test-experiment" }])
      done()
    })
  })

  it("should return experiment name on get at /experiments/experiment-name", done => {
    setUpExperiment("test-experiment")
    request.get("http://localhost:3000/experiments/test-experiment", (err, res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.equal("test-experiment")
      done()
    })
  })

  it("should return experiment name on post at /experiments", done => {
    restler.post("http://localhost:3000/experiments", {
      multipart: true,
      data: { name: "test-experiment" }
    }).on("complete", (data, response) => {
      expect(response.statusCode).to.equal(200)
      expect(data).to.equal("test-experiment")
      done()
    })
  })
})
