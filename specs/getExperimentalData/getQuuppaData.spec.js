const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { keys, pick, slice, sortBy } = require("lodash")
const { dbDrop, dbSync } = require("../helpers/db")
const data = require("../testData/mockQuuppaData.json")
const { insertExperiment, insertPoints } = require("../../src/storeData/index")
const { getQuuppaData, getDataForAllNodes } = require("../../src/getExperimentalData/getQuuppaData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodePositions = require("../testData/nodePositions.json")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positions = require("../testData/positions.json")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Get Quuppa data", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("Get data from the Quuppa server", () => {
    it("returns the nodes data", async () => {
      const response = await getQuuppaData()
      const ids = sortBy(response.data.tags.map(tag => tag.id), ["id"])
      expect(response.status).to.equal(200)
      expect(ids.sort()).to.deep.equal([
        "20914830f65a",
        "20914830ce00",
        "e0e5cfb58d13"
      ].sort())
    })
  })

  describe("Get data for all nodes", () => {
    it("retrieves Quuppa position data and stores it", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositions)
      await getDataForAllNodes("test-experiment", data)
      const positionDataQueryResults = await PositionData.findAll()
      await checkPositionData(positionDataQueryResults)
    })

    it("retrieves Quuppa position data and stores it only for nodes that have a defined node " +
      "position", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(slice(JSON.parse(JSON.stringify(nodePositions)), 0, 2))
      await getDataForAllNodes("test-experiment", data)
      const positionDataQueryResults = await PositionData.findAll()
      expect(positionDataQueryResults).to.have.length(2)
      expect(positionDataQueryResults.map(data => data.localizedNodeName))
        .to.deep.equal(["Node1", "Node2"])
    })
  })
})

function checkPositionData(queryResults) {
  expect(
    sortBy(queryResults, ["pointName"])
      .map(position => pick(position, keys(positions[0])))
  ).to.deep.equal(positions)
}
