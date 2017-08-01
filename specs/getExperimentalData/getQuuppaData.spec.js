const { describe, it, before, after } = require("mocha")
const { expect } = require("chai")
const { sortBy } = require("lodash")
const { checkPositionData } = require("../helpers/data")
const { dbDrop, dbSync } = require("../helpers/db")
const data = require("../testData/mockQuuppaData.json")
const { insertExperiment, insertPoints, insertNodePositions } = require("../../src/storeData/index")
const { getQuuppaData, getDataForAllTags } = require("../../src/getExperimentalData/getQuuppaData")
const nodePositions = require("../testData/nodePositionsQuuppa.json")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")


describe("Get Quuppa data", () => {
  before(async () => {
    await dbSync()
  })

  after(async () => {
    await dbDrop()
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
      await insertExperiment("test-experiment")
      await insertPoints(points)
      await insertNodePositions(nodePositions)
      await getDataForAllTags("test-experiment", data)
      const positionDataQueryResults = await PositionData.findAll()
      await checkPositionData(positionDataQueryResults, false, false)
    })
  })
})
