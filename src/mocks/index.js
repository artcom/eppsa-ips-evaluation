const data = require("../../specs/testData/pointMeasurements.json")
const storePositionData = require("../storeData/storePositionData")


exports.insertMockPositionData = async function insertMockPositionData(experimentName) {
  return await storePositionData(data.map(datum => ({
    pointName: datum.pointName,
    localizedNodeId: datum.localizedNodeId,
    experimentName,
    localizedNodeName: datum.localizedNodeName,
    estCoordinateX: datum.estCoordinateX,
    estCoordinateY: datum.estCoordinateY,
    estCoordinateZ: datum.estCoordinateZ,
    estRoomLabel: datum.estRoomLabel,
    latency: datum.latency,
    powerConsumption: datum.powerConsumption
  })))
}
