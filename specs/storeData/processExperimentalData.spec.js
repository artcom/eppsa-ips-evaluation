const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { concat, includes, keys, omit, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const Point = require("../../src/models/point")
const pointErrors = require("../testData/pointErrors.json")
const points = require("../testData/points.json")
const positionData = require("../testData/positionData.json")
const PositionData = require("../../src/models/positionData")
const { positionDataNoErrors } = require("../helpers/data")
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
              const errorKeys = ["localizationError2d", "localizationError3d", "roomAccuracy"]
              const storedPositionData = queryResults
                .map(queryResult =>
                  pick(queryResult, keys(positionData[0]).filter(key => !includes(errorKeys, key)))
                )
              const storedPositionErrors = sortBy(
                queryResults
                .map(queryResult => pick(queryResult, concat(errorKeys, "pointName"))),
                ["pointName"]
              )
              const positionErrors = sortBy(positionData
                .map(position => pick(position, concat(errorKeys, "pointName"))), ["pointName"])

              expect(sortBy(storedPositionData, ["pointName"]))
                .to.deep.equal(sortBy(positionDataNoErrors(positionData), ["pointName"]))

              for (const storedPosition of storedPositionErrors) {
                const index = storedPositionErrors.indexOf(storedPosition)
                for (const key of errorKeys) {
                  expect(storedPosition[key])
                    .to.be.closeTo(positionErrors[index][key], 0.00000000000001)
                }
              }
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
                const errorKeys = ["localizationError2d", "localizationError3d", "roomAccuracy"]
                const storedPositionData = queryResults
                  .map(queryResult =>
                    pick(queryResult, keys(positionData[0])
                      .filter(key => !includes(errorKeys, key)))
                  )
                const storedPositionErrors = sortBy(
                  queryResults
                  .map(queryResult => pick(queryResult, concat(errorKeys, "pointName"))),
                  ["pointName"]
                )
                const positionErrors = sortBy(positionData
                  .map(position => pick(position, concat(errorKeys, "pointName"))), ["pointName"])

                expect(sortBy(storedPositionData, ["pointName"]))
                  .to.deep.equal(sortBy(positionDataNoErrors(positionData), ["PointName"]))

                for (const storedPosition of storedPositionErrors) {
                  const index = storedPositionErrors.indexOf(storedPosition)
                  for (const key of errorKeys) {
                    expect(storedPosition[key])
                      .to.be.closeTo(positionErrors[index][key], 0.00000000000001)
                  }
                }
                done()
              }).catch(done)
          })
      }
    )
  })
})
