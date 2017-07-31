const { errors } = require("../computations/errors")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const { primaryMetrics } = require("../computations/primaryMetrics")
const ExperimentMetrics = require("../models/experimentMetrics")


const storePrimaryMetrics = async function storePrimaryMetrics(primaryMetrics) {
  await ExperimentMetrics.create(primaryMetrics)
}

const updatePositionDataErrors = async function updatePositionDataErrors(
  processedData,
  experimentName
) {
  for (const processedDatum of processedData) {
    PositionData.update(
      processedDatum,
      { where: { localizedNodeId: processedDatum.localizedNodeId, experimentName } },
      { fields: ["localizationError2d", "localizationError3d", "roomAccuracy"] },
    )
  }
}

const processData = async function processData(experimentName) {
  const positionData = await PositionData.findAll({
    where: { experimentName },
    include: { model: Point }
  })
  const processedData = errors(positionData)
  console.log(processedData)
  const experimentPrimaryMetrics = primaryMetrics(processedData, positionData, experimentName)
  console.log(experimentPrimaryMetrics)
  await updatePositionDataErrors(processedData, experimentName)
  await storePrimaryMetrics(experimentPrimaryMetrics)
}

exports.storePrimaryMetrics = storePrimaryMetrics
exports.updatePositionDataErrors = updatePositionDataErrors
exports.processData = processData
