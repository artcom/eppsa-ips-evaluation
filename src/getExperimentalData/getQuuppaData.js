const estimateRoom = require("../computations/estimateRoom")
const NodePosition = require("../models/nodePosition")
const { quuppaServer } = require("../quuppa")
const storePositionData = require("../storeData/storePositionData")


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
  await storePositionData(response.data.tags.map(tag => ({
    localizedNodeId: tag.id,
    localizedNodeName: tag.name,
    estCoordinateX: tag.smoothedPosition[0],
    estCoordinateY: tag.smoothedPosition[1],
    estCoordinateZ: tag.smoothedPosition[2],
    estZoneLabel: estimateRoom(
      tag.smoothedPosition[0],
      tag.smoothedPosition[1],
      tag.smoothedPosition[2]
    ),
    pointName: nodePositions.find(position => position.localizedNodeId === tag.id).pointName,
    experimentName
  })))
}

exports.getQuuppaData = getQuuppaData
exports.getDataForAllTags = getDataForAllTags
