const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { keys, pick, sortBy } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const nodePositions = require("../testData/nodePositions.json")
const NodePosition = require("../../src/models/nodePosition")


describe("Model NodePosition", () => {
  before((done) => {
    dbSync().then(done).catch(done)
  })

  after((done) => {
    dbDrop().then(done).catch(done)
  })

  describe("Model NodePosition basic function", () => {
    it("can create node positions", done => {
      Experiment.create({ name: "test-experiment" })
        .then(() => {
          NodePosition.bulkCreate(nodePositions)
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
