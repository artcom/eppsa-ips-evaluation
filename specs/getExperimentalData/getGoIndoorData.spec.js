const { expect } = require("chai")
const { isEqual } = require("lodash")
const { describe, it, beforeEach, afterEach } = require("mocha")
const sinon = require("sinon")
const proxyquire = require("proxyquire")
const {
  getAverage,
  getNodeIds,
  getNodeData,
  getDataForAllNodes
} = require("../../src/getExperimentalData/getGoIndoorData")
const goIndoor = require("../../src/goIndoor")
const mockGoIndoorData = require("../testData/mockGoIndoorData.json")
const nodes = require("../testData/nodesGoIndoor.json")

describe("getGoIndoorData", () => {
  describe("getNodeIds", () => {
    it("should return the node IDs", async () => {
      const nodeIds = await getNodeIds()
      expect(nodeIds).to.deep.equal(nodes)
    })
  })

  describe("getNodeData", () => {
    it("should return the data for a node", async () => {
      const data = await getNodeData(nodes[0])
      expect(data).to.have.length(10)
    })
  })

  describe("getAverage", () => {
    it("should return average x and y coordinates", () => {
      const average = getAverage(mockGoIndoorData)
      const expectedAverage = { x: "8.09", y: "1.59" }
      expect(isEqual(average, expectedAverage)).to.equal(true)
    })
  })

  describe("getDataForAllNodes", () => {
    let goIndoorServerGetMock

    beforeEach(() => {
      goIndoorServerGetMock = sinon.stub(goIndoor.goIndoorServer, "get").callsFake(getFake)
      proxyquire(
        "../../src/getExperimentalData/getGoIndoorData",
        { goIndoorServer: { get: goIndoorServerGetMock } }
      )
    })

    afterEach(() => {
      goIndoorServerGetMock.restore()
    })

    it("should return position data for all listed nodes", async () => {
      const data = await getDataForAllNodes()
      const expectedData = nodes.map(node => ({ node, data: { x: "8.09", y: "1.59" } }))
      sinon.assert.calledThrice(goIndoorServerGetMock)
      expect(isEqual(data, expectedData)).to.equal(true)
    })
  })
})

async function getFake(url) {
  if (url === "/") {
    return { data: nodes }
  } else if (url === "/id/SamsungTab") {
    return { data: mockGoIndoorData }
  } else if (url === "/id/SamsungPhone") {
    return { data: mockGoIndoorData }
  }
}
