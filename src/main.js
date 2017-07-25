const data = require("../data/pointMeasurements.json")
const getDataForAllTags = require("./getExperimentalData/getQuuppaData")
const { initializePoints } = require("./initializeDb")
const processData = require("./storeData/processExperimentalData")
const storePositionData = require("./storeData/storePositionData")


initializePoints()
  .then(() => insertMockPositionData().then(() => processData("test_1")))
  .catch(error => console.error(error))

async function insertMockPositionData() {
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

getDataForAllTags("test_2")
