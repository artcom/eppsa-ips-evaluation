const NodePosition = require("../models/nodePosition")
const quuppa = require("../quuppa")
const storePositionData = require("../storeData/storePositionData")

module.exports = async function getDataForAllTags(experimentId) {
  const response = await getQuuppaData()
  const nodePositions = await NodePosition.findAll({ where:
      { localizedNodeId: { $in: response.data.tags.map(tag => tag.id) }, experimentId }
  })
  await storePositionData(response.data.tags.map(tag => ({
    localizedNodeId: tag.id,
    localizedNodeName: tag.name,
    estCoordinateX: tag.smoothedPosition[0],
    estCoordinateY: tag.smoothedPosition[1],
    estCoordinateZ: tag.smoothedPosition[2],
    estRoomLabel: "Room_1",
    pointId: nodePositions.find(position => position.localizedNodeId === tag.id).pointId,
    experimentId
  })))
}

async function getQuuppaData() {
  return await quuppa.get("getHAIPLocation", {
    params: {
      version: 2
    }
  })
}
