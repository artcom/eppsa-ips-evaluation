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
  const data = await Promise.all(response.data.tags.map(async (tag) => ({
    localizedNodeId: tag.id,
    localizedNodeName: tag.name,
    estCoordinateX: tag.smoothedPosition[0],
    estCoordinateY: tag.smoothedPosition[1],
    estCoordinateZ: tag.smoothedPosition[2],
    pointName: nodePositions.find(position => position.localizedNodeName === tag.name).pointName,
    experimentName
  })))
  await insertPositionData(data)
}

exports.getQuuppaData = getQuuppaData
exports.getDataForAllNodes = getDataForAllNodes
