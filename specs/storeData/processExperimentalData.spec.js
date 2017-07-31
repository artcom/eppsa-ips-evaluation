const { describe, it, beforeEach, afterEach } = require("mocha")
const { dbSync, dbDrop } = require("../helpers/db")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const Point = require("../../src/models/point")
const pointErrors = require("../testData/pointErrors.json")
const points = require("../testData/points.json")
const positionData = require("../testData/positionData.json")
const PositionData = require("../../src/models/positionData")
const { positionDataNoErrors, checkPositionData, checkPrimaryMetrics } = require("../helpers/data")
const {
  storePrimaryMetrics,
  updatePositionDataErrors,
  processData
} = require("../../src/storeData/processExperimentalData")


describe("Process experimental data", () => {
  beforeEach((done) => {
    dbSync().then(done).catch(done)
  })

  afterEach((done) => {
    dbDrop().then(done).catch(done)
  })

  describe("storePrimaryMetrics basic function", () => {
    it("stores experiment metrics", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => {
          storePrimaryMetrics(experimentPrimaryMetrics)
            .then(() => {
              ExperimentMetrics.findAll({
                where: { experimentName: "test-experiment" },
                include: { model: Experiment }
              })
                .then(experimentMetrics => {
                  checkPrimaryMetrics(experimentMetrics)
                  done()
                }).catch(done)
            }).catch(done)
        }).catch(done)
    })
  })

  describe("updatePositionDataErrors", () => {
    it("updates the position data with the position error data", done => {
      checkUpdatePositionDataErrors().then(done).catch(done)
    })
  })

  describe("processData basic function", () => {
    it("updates the position data with the position error data", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => Point.bulkCreate(points))
        .then(() => {
          PositionData.bulkCreate(positionDataNoErrors(positionData))
        }).then(() => PositionData.findAll())
        .then(() => {
          processData("test-experiment")
            .then(() => PositionData.findAll())
            .then(queryResults => {
              checkPositionData(queryResults)
              done()
            }).catch(done)
        })
    })

    it("stores experiment metrics", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => Point.bulkCreate(points))
        .then(() => {
          PositionData.bulkCreate(positionDataNoErrors(positionData))
        })
        .then(() => PositionData.findAll())
        .then(() => {
          processData("test-experiment")
            .then(() => {
              ExperimentMetrics.findAll({
                where: { experimentName: "test-experiment" },
                include: { model: Experiment }
              })
                .then(experimentMetrics => {
                  checkPrimaryMetrics(experimentMetrics)
                  done()
                }).catch(done)
            }).catch(done)
        })
    })
  })
})

async function setUpDatabase() {
  await Experiment.create({ name: "test-experiment" })
  await Point.bulkCreate(points)
  await PositionData.bulkCreate(positionDataNoErrors(positionData))
}

async function checkUpdatePositionDataErrors() {
  await setUpDatabase()
  await updatePositionDataErrors(pointErrors, "test-experiment")
  const queryResults = await PositionData.findAll()
  await checkPositionData(queryResults)
}
