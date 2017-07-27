const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { concat, includes, keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positionData = require("../testData/positionData.json")


describe("Model PositionData", () => {
  before((done) => {
    dbSync().then(done).catch(done)
  })

  after((done) => {
    dbDrop().then(done).catch(done)
  })

  describe("Model PositionData basic function", () => {
    it("can create position data", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => Point.bulkCreate(points))
        .then(() => {
          PositionData.bulkCreate(positionData)
          .then(() => PositionData.findAll())
          .then(queryResults => {
            const errorKeys = ["localizationError2d", "localizationError3d"]
            const storedPositionData = queryResults
              .map(queryResult =>
                pick(queryResult, keys(positionData[0]).filter(key => !includes(errorKeys, key)))
              )
            const positionDataNoErrors = positionData
              .map(position =>
                pick(position, keys(positionData[0]).filter(key => !includes(errorKeys, key)))
              )
            const storedPositionErrors = sortBy(queryResults
              .map(queryResult => pick(queryResult, concat(errorKeys, "pointId"))), ["pointId"])
            const positionErrors = sortBy(positionData
              .map(position => pick(position, concat(errorKeys, "pointId"))), ["pointId"])

            expect(sortBy(storedPositionData, ["pointId"]))
              .to.deep.equal(sortBy(positionDataNoErrors, ["PointId"]))

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
})
