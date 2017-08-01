const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const nodePositions = require("../testData/nodePositions.json")
const NodePosition = require("../../src/models/nodePosition")
const Point = require("../../src/models/point")
const points = require("../testData/points.json")
const { insertPoints, insertExperiment, insertNodePositions } = require("../../src/storeData/index")


describe("Set up experiment", () => {
  beforeEach((done) => {
    dbSync().then(done).catch(done)
  })

  afterEach((done) => {
    dbDrop().then(done).catch(done)
  })

  describe("insertPoints basic function", () => {
    it("can create points", done => {
      insertPoints(points)
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

  describe("insertExperiment basic function", () => {
    it("can create an experiment", done => {
      insertExperiment("test-experiment")
        .then(() => {
          Experiment.findAll().then(experiments => {
            expect(experiments[0].name).to.equal("test-experiment")
          })
          done()
        }).catch(done)
    })
  })

  describe("insertNodePositions basic function", () => {
    it("can create node positions", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => {
          insertNodePositions(nodePositions)
            .then(() =>
              NodePosition.findAll({ include: { model: Experiment } })
                .then(storedPositions => {
                  const storedNodePositions = storedPositions
                    .map(storedPosition => pick(storedPosition, keys(nodePositions[0])))
                  for (const position of storedPositions) {
                    expect(position.experiment.name).to.equal("test-experiment")
                  }
                  expect(sortBy(storedNodePositions, ["localizedNodeId"]))
                    .to.deep.equal(sortBy(nodePositions, ["localizedNodeId"]))
                  done()
                }).catch(done)
            ).catch(done)
        }).catch(done)
    })
  })
})
