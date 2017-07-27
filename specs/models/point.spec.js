const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")


describe("Model Point", () => {
  before((done) => {
    dbSync().then(done).catch(done)
  })

  after((done) => {
    dbDrop().then(done).catch(done)
  })

  describe("Model Point basic function", () => {
    it("can create points", done => {
      Point.bulkCreate(points)
        .then(() => Point.findAll())
        .then(queryResults => {
          const storedPoints = queryResults
            .map(queryResult => pick(queryResult, keys(points[0])))
          expect(sortBy(storedPoints, ["pointId"]))
            .to.deep.equal(sortBy(points, ["PointId"]))
          done()
        }).catch(done)
    })
  })
})
