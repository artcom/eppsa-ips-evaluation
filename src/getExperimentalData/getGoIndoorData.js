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
    nodesGoIndoor.map(async node => {
      const data = getAverage(await getNodeData(node))
      const localizedNodeName = storedNodes.find(storedNode => storedNode.id === node).name
      return {
        localizedNodeId: node,
        localizedNodeName,
        estCoordinateX: data.x,
        estCoordinateY: data.y,
        pointName: nodePositions.find(position =>
          position.localizedNodeName === localizedNodeName
        ).pointName,
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
