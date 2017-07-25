const data = require("../data/pointMeasurements.json")
const errors = require("./computations/errors")
const getDataForAllTags = require("./getExperimentalData/getQuuppaData")
const { initializePoints } = require("./initializeDb")
const NodePosition = require("./models/nodePosition")
const Point = require("./models/point")
const primaryMetrics = require("./computations/primaryMetrics")
const storePositionData = require("./storeData/storePositionData")


initializePoints()
  .then(() =>
    Point
      .findAll()
      .then(points => console.log(`points: ${points.map(point => point.pointId)}`))
  )
  .catch(error => console.error(error))


getDataForAllTags()
  .then(response => NodePosition.findAll({ where:
    { localizedNodeId: { $in: response.data.tags.map(tag => tag.id) } }
  })
    .then(positions => storePositionData(response.data.tags.map(tag => ({
      localizedNodeId: tag.id,
      localizedNodeName: tag.name,
      estCoordinateX: tag.smoothedPosition[0],
      estCoordinateY: tag.smoothedPosition[1],
      estCoordinateZ: tag.smoothedPosition[2],
      estRoomLabel: "Room_1",
      pointId: positions.find(position => position.localizedNodeId === tag.id).pointId
    }))))
    .catch(error => console.error(error))
  )
  .catch(error => console.error(error))

function processData(data) {
  const processedData = errors(data)
  return primaryMetrics(processedData, data)
}

console.log(processData(data))
