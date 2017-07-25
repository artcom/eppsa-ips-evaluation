const errors = require("../computations/errors")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const primaryMetrics = require("../computations/primaryMetrics")

module.exports = async function processData(experimentId) {
  return await PositionData.findAll({
    where: { experimentId },
    include: { model: Point }
  }).then(positionData => {
    const processedData = errors(positionData)
    console.log(primaryMetrics(processedData, positionData, experimentId))
  })
}
