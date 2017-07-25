const data = require("../../data/pointMeasurements.json")
const storePositionData = require("../storeData/storePositionData")


exports.insertMockPositionData = async function insertMockPositionData() {
  return await storePositionData(data.map(datum => ({
    pointId: datum.pointId,
    localizedNodeId: datum.localizedNodeId,
    experimentId: "test_1",
    localizedNodeName: datum.localizedNodeName,
    estCoordinateX: datum.estCoordinateX,
    estCoordinateY: datum.estCoordinateY,
    estCoordinateZ: datum.estCoordinateZ,
    estRoomLabel: datum.estRoomLabel
  })))
}
