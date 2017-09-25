const { find } = require("lodash")
const Node = require("../models/node")
const NodePosition = require("../models/nodePosition")
const { quuppaServer } = require("../quuppa")
const { insertPositionData } = require("../../src/storeData")


const getQuuppaData = async function getQuuppaData() {
  return await quuppaServer.get("getHAIPLocation", {
    params: {
      version: 2
    }
  })
}

const getDataForAllNodes = async function getDataForAllNodes(experimentName, response) {
  const nodePositions = await NodePosition.findAll({ where:
      { localizedNodeName: { $in: response.data.tags.map(tag => tag.name) }, experimentName }
  })
  const storedNodes = await Node.findAll()
  const positionData = await Promise.all(nodePositions.map(position => {
    const localizedNodeName = position.localizedNodeName
    const localizedNodeId = storedNodes
      .find(storedNode => storedNode.name === localizedNodeName).id
    const tag = find(response.data.tags, tag => tag.name === localizedNodeName)
    return {
      localizedNodeId,
      localizedNodeName,
      estCoordinateX: tag.smoothedPosition[0],
      estCoordinateY: tag.smoothedPosition[1],
      estCoordinateZ: tag.smoothedPosition[2],
      pointName: position.pointName,
      experimentName
    }
  }))
  await insertPositionData(positionData)
}

exports.getQuuppaData = getQuuppaData
exports.getDataForAllNodes = getDataForAllNodes
