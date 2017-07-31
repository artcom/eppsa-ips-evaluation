const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const sinon = require("sinon")
const { pick } = require("lodash")
const { checkPrimaryMetrics } = require("../helpers/data")
const { dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const { getMockData } = require("../mocks/getExperimentalData")
const Point = require("../../src/models/point")
const points = require("../../data/points.json")
const { QuuppaExperiment, setUpDb } = require("../../src/runExperiment/quuppaExperiment")


describe("Run a Quuppa experiment", () => {
  beforeEach(done => {
    dbDrop().then(done).catch(done)
  })

  afterEach((done) => {
    dbDrop().then(done).catch(done)
  })

  describe("Database set up", () => {
    it("should set up the database", done => {
      testDbSetup()
        .then(storedPoints => {
          expect(storedPoints).to.deep.equal(points)
          done()
        }).catch(done)
    })
  })

  describe("Run", () => {
    it("should run the entire experiment and save the data", done => {
      const quuppaExperiment = new QuuppaExperiment("test_quuppa")
      const getData = sinon.stub(quuppaExperiment, "getQuuppaData").callsFake(getMockData)
      quuppaExperiment.run()
        .then(() => {
          sinon.assert.calledOnce(getData)
          ExperimentMetrics.findAll({
            where: { experimentName: "test_quuppa" },
            include: { model: Experiment }
          })
            .then(experimentMetrics => {
              checkPrimaryMetrics(experimentMetrics, "test_quuppa", false)
              done()
            }).catch(done)
        }).catch(done)
    })
  })
})

async function testDbSetup() {
  await setUpDb()
  const points = await Point.findAll()
  return points.map(point => pick(point, [
    "name",
    "trueCoordinateX",
    "trueCoordinateY",
    "trueCoordinateZ",
    "trueRoomLabel"
  ]))
}