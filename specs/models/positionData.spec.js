const { describe, it, before, after } = require("mocha")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positionData = require("../testData/positionData.json")
const { checkPositionData } = require("../helpers/data")


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
            checkPositionData(queryResults)
            done()
          }).catch(done)
        })
    })
  })
})
