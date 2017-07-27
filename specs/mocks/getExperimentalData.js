const { pick, assignIn } = require("lodash")
const data = require("../testData/pointMeasurements.json")


const getMockData = async function getData(experimentName) {
  const experimentalData = data.map(datum => assignIn({ experimentName }, pick(datum, [
    "pointName",
    "localizedNodeId",
    "localizedNodeName",
    "estCoordinateX",
    "estCoordinateY",
    "estCoordinateZ",
    "estRoomLabel",
    "latency",
    "powerConsumption"
  ])))
  console.log(experimentalData)
  return experimentalData
}

exports.getMockData = getMockData
