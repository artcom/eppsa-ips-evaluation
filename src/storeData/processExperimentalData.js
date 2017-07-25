const errors = require("../computations/errors")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const primaryMetrics = require("../computations/primaryMetrics")
const ExperimentMetrics = require("../models/experimentMetrics")

module.exports = async function processData(experimentId) {
  const positionData = await PositionData.findAll({
    where: { experimentId },
    include: { model: Point }
  })
  const processedData = errors(positionData)
  const experimentPrimaryMetrics = primaryMetrics(processedData, positionData, experimentId)
  await storePrimaryMetrics(experimentPrimaryMetrics)
}

async function storePrimaryMetrics(primaryMetrics) {
  await ExperimentMetrics.create(primaryMetrics)
}
