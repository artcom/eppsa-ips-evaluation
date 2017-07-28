const { describe, it, after } = require("mocha")
const { expect } = require("chai")
const { dbDrop } = require("../helpers/db")
const { initializeDb } = require("../../src/initializeDb")
const Point = require("../../src/models/point")
const Experiment = require("../../src/models/experiment")


describe("Initialize database", () => {
  after((done) => {
    dbDrop().then(done).catch(done)
  })

  it("should create all tables in the database", done => {
    testDbInitialization().then(data => {
      expect(data).to.deep.equal({ points: [], experiments: [] })
      done()
    }).catch(done)
  })
})

async function testDbInitialization() {
  await initializeDb()
  const points = await Point.findAll()
  const experiments = await Experiment.findAll()
  return { points, experiments }
}
