const NodePosition = require("../models/nodePosition")
const quuppa = require("../quuppa")
const storePositionData = require("../storeData/storePositionData")

module.exports = async function getDataForAllTags(experimentId) {
  return await quuppa.get("getHAIPLocation", {
    params: {
      version: 2
    }
  }).then(response =>
    NodePosition.findAll({ where:
      { localizedNodeId: { $in: response.data.tags.map(tag => tag.id) }, experimentId }
    }).then(positions => storePositionData(response.data.tags.map(tag => ({
      localizedNodeId: tag.id,
      localizedNodeName: tag.name,
      estCoordinateX: tag.smoothedPosition[0],
      estCoordinateY: tag.smoothedPosition[1],
      estCoordinateZ: tag.smoothedPosition[2],
      estRoomLabel: "Room_1",
      pointId: positions.find(position => position.localizedNodeId === tag.id).pointId,
      experimentId
    })))).catch(error => console.error(error))
  ).catch(error => console.error(error))
}
