const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { sortBy } = require("lodash")
const { checkPositionData } = require("../helpers/data")
const { dbDrop, dbSync } = require("../helpers/db")
const data = require("../testData/mockQuuppaData.json")
const { setUpExperiment, setUpPoints, setUpNodePositions } = require("../../src/setUpExperiment")
const { getQuuppaData, getDataForAllTags } = require("../../src/getExperimentalData/getQuuppaData")
const nodePositions = require("../testData/nodePositionsQuuppa.json")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")


describe("Get Quuppa data", () => {
  before(done => {
    dbSync().then(done).catch(done)
  })

  after((done) => {
    dbDrop().then(done).catch(done)
  })

  describe("Get data from the Quuppa server", () => {
    it("returns the nodes data", async () => {
      const response = await getQuuppaData()
      const ids = sortBy(response.data.tags.map(tag => tag.id), ["id"])
      expect(response.status).to.equal(200)
      expect(ids).to.deep.equal([
        "20914830f65a",
        "20914830ce00",
        "e0e5cfb58d13"
      ])
    })
  })

  describe("Get data for all tags", () => {
    it("retrieves Quuppa position data and stores it", async () => {
      await setUpExperiment("test-experiment")
      await setUpPoints(points)
      await setUpNodePositions(nodePositions)
      await getDataForAllTags("test-experiment", data)
      const positionDataQueryResults = await PositionData.findAll()
      await checkPositionData(positionDataQueryResults, false, false)
    })
  })
})
