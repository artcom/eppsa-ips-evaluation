const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const request = require("request")
const { dbSync, dbDrop } = require("../helpers/db")
const { setUpExperiment } = require("../../src/setUpExperiment")
const server = require("../../src/server")

describe("Server response", () => {
  before((done) => {
    dbSync().then(done).catch(done)
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  after((done) => {
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

  it("should return all experiments at /experiments", done => {
    setUpExperiment("test-experiment")
    request.get("http://localhost:3000/experiments", (err, res) => {
      expect(res.statusCode).to.equal(200)
      expect(JSON.parse(res.body)).to.deep.equal([{ name: "test-experiment" }])
      done()
    })
  })
})
