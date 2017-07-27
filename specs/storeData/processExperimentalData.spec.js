const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, omit } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const Point = require("../../src/models/point")
const pointErrors = require("../testData/pointErrors.json")
const points = require("../testData/points.json")
const positionData = require("../testData/positionData.json")
const PositionData = require("../../src/models/positionData")
const { positionDataNoErrors, checkPositionData } = require("../helpers/data")
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
                  expect(experimentMetrics[0].experimentName).to.equal("test-experiment")
                  for (const key of keys(omit(experimentPrimaryMetrics, ["experimentName"]))) {
                    expect(experimentMetrics[0][key])
                      .to.be.closeTo(experimentPrimaryMetrics[key], 0.0000000000001)
                  }
                  expect(experimentMetrics[0].experiment.name).to.equal("test-experiment")
                  done()
                }).catch(done)
            }).catch(done)
        }).catch(done)
    })
  })

  describe("updatePositionDataErrors basic function", () => {
    it("updates the position data with the position error data", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => Point.bulkCreate(points))
        .then(() => {
          PositionData.bulkCreate(positionDataNoErrors(positionData))
        })
        .then(() => {
          updatePositionDataErrors(pointErrors, "test-experiment")
            .then(() => PositionData.findAll())
            .then(queryResults => {
              checkPositionData(queryResults)
              done()
            }).catch(done)
        })
    })
  })

  describe("processData basic function", () => {
    it(
      "updates the position data with the position error data and stores experiment metrics",
      done => {
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
      }
    )
  })
})
