const NodePosition = require("../models/nodePosition")
const quuppa = require("../quuppa")
const storePositionData = require("../storeData/storePositionData")

module.exports = async function getDataForAllTags(experimentName) {
  const response = await getQuuppaData()
  const nodePositions = await NodePosition.findAll({ where:
      { localizedNodeId: { $in: response.data.tags.map(tag => tag.id) }, experimentName }
  })
  await storePositionData(response.data.tags.map(tag => ({
    localizedNodeId: tag.id,
    localizedNodeName: tag.name,
    estCoordinateX: tag.smoothedPosition[0],
    estCoordinateY: tag.smoothedPosition[1],
    estCoordinateZ: tag.smoothedPosition[2],
    estRoomLabel: "Room_1",
    pointName: nodePositions.find(position => position.localizedNodeId === tag.id).pointName,
    experimentName
  })))
}

async function getQuuppaData() {
  return await quuppa.get("getHAIPLocation", {
    params: {
      version: 2
    }
  })
}
