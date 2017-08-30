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

const getDataForAllTags = async function getDataForAllTags(experimentName, response) {
  const nodePositions = await NodePosition.findAll({ where:
      { localizedNodeId: { $in: response.data.tags.map(tag => tag.id) }, experimentName }
  })
  const data = await Promise.all(response.data.tags.map(async (tag) => ({
    localizedNodeId: tag.id,
    localizedNodeName: tag.name,
    estCoordinateX: tag.smoothedPosition[0],
    estCoordinateY: tag.smoothedPosition[1],
    estCoordinateZ: tag.smoothedPosition[2],
    pointName: nodePositions.find(position => position.localizedNodeId === tag.id).pointName,
    experimentName
  })))
  await insertPositionData(data)
}

exports.getQuuppaData = getQuuppaData
exports.getDataForAllTags = getDataForAllTags
