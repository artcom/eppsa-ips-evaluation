const { expect } = require("chai")
const { isEqual, keys, omit, pick, slice, sortBy } = require("lodash")
const { describe, it, beforeEach, afterEach } = require("mocha")
const sinon = require("sinon")
const proxyquire = require("proxyquire")
const { dbDrop, dbSync } = require("../helpers/db")
const {
  getAverage,
  getNodeIds,
  getNodeData,
  getDataForAllNodes
} = require("../../src/getExperimentalData/getGoIndoorData")
const goIndoor = require("../../src/goIndoor")
const { getFake } = require("../mocks/goIndoorServer")
const mockGoIndoorData = require("../testData/mockGoIndoorData.json")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodePositions = require("../testData/nodePositions.json")
const nodes = require("../testData/nodes.json")
const nodesGoIndoor = require("../testData/nodesGoIndoor.json")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positions = require("../testData/positions.json")
const { insertExperiment, insertPoints } = require("../../src/storeData/index")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")

describe("getGoIndoorData", () => {
  describe("getNodeIds", () => {
    it("should return the node IDs", async () => {
      const nodeIds = await getNodeIds()
      expect(nodeIds).to.deep.equal(nodesGoIndoor)
    })
  })

  describe("getNodeData", () => {
    it("should return the data for a node", async () => {
      const data = await getNodeData(nodesGoIndoor[0])
      expect(data).to.have.length(10)
    })
  })

  describe("getAverage", () => {
    it("should return average x and y coordinates", () => {
      const average = getAverage(mockGoIndoorData[0])
      const expectedAverage = { x: "0.90", y: "1.01" }
      expect(isEqual(average, expectedAverage)).to.equal(true)
    })
  })

  describe("getDataForAllNodes", () => {
    let goIndoorServerGetMock

    beforeEach(async () => {
      goIndoorServerGetMock = sinon.stub(goIndoor.goIndoorServer, "get").callsFake(getFake)
      proxyquire(
        "../../src/getExperimentalData/getGoIndoorData",
        { goIndoorServer: { get: goIndoorServerGetMock } }
      )
      await dbSync()
    })

    afterEach(async () => {
      goIndoorServerGetMock.restore()
      await dbDrop()
    })

    it("should store position data", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(nodePositions)
      await getDataForAllNodes("test-experiment")
      const positionDataQueryResults = await PositionData.findAll()
      await checkPositionData(positionDataQueryResults)
    })

    it("should store position data only for nodes that have a defined node position", async () => {
      await insertExperiment("test-experiment")
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await NodePosition.bulkCreate(slice(JSON.parse(JSON.stringify(nodePositions)), 0, 2))
      await getDataForAllNodes("test-experiment")
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
      .map(position => omit(pick(position, keys(positions[0])), ["estCoordinateZ"]))
  ).to.deep.equal(positions.map(position => omit(position, ["estCoordinateZ"])))
}

