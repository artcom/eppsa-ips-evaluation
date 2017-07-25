const errors = require("../computations/errors")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const primaryMetrics = require("../computations/primaryMetrics")
const ExperimentMetrics = require("../models/experimentMetrics")

module.exports = async function processData(experimentId) {
  return await PositionData.findAll({
    where: { experimentId },
    include: { model: Point }
  }).then(positionData => {
    const processedData = errors(positionData)
    const experimentPrimaryMetrics = primaryMetrics(processedData, positionData, experimentId)
    storePrimaryMetrics(experimentPrimaryMetrics).then()
  })
}

async function storePrimaryMetrics(primaryMetrics) {
  return await ExperimentMetrics.create(primaryMetrics)
}
