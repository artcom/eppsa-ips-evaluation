const { meanBy } = require("lodash")
const { goIndoorServer } = require("../../src/goIndoor")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const { insertPositionData } = require("../../src/storeData")


const getAverage = function getAverage(data) {
  return {
    x: meanBy(data, datum => Number(datum.x)).toFixed(2),
    y: meanBy(data, datum => Number(datum.y)).toFixed(2)
  }
}

const getNodeIds = async function getNodeIds() {
  const response = await goIndoorServer.get("/")
  return response.data
}

const getNodeData = async function getNodeData(node) {
  const response = await goIndoorServer.get(`/id/${node}`)
  return response.data
}

const getDataForAllNodes = async function getDataForAllNodes(experimentName) {
  const nodesGoIndoor = await getNodeIds()
  const nodePositions = await NodePosition.findAll({
    include: [{
      model: Node, as: "localizedNode",
      where: { id: { $in: nodesGoIndoor } }
    }],
    where: { experimentName }
  })
  const storedNodes = await Node.findAll()
  const positionData = await Promise.all(
    nodePositions.map(async node => {
      const localizedNodeId = storedNodes
        .find(storedNode => storedNode.name === node.localizedNodeName).id
      const data = getAverage(await getNodeData(localizedNodeId))
      return {
        localizedNodeId,
        localizedNodeName: node.localizedNodeName,
        estCoordinateX: data.x,
        estCoordinateY: data.y,
        pointName: node.pointName,
        experimentName
      }
    })
  )
  await insertPositionData(positionData)
}

exports.getAverage = getAverage
exports.getNodeIds = getNodeIds
exports.getNodeData = getNodeData
exports.getDataForAllNodes = getDataForAllNodes
