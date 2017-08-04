const { errors } = require("../computations/errors")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const { primaryMetrics } = require("../computations/primaryMetrics")
const { upsertPrimaryMetrics } = require("../storeData")


const updatePositionDataErrors = async function updatePositionDataErrors(
  processedData
) {
  await Promise.all(processedData.map(processedDatum =>
    PositionData.update(
      processedDatum,
      { where: { id: processedDatum.id } },
      { fields: ["localizationError2d", "localizationError3d", "zoneAccuracy"] },
    )
  ))
}

const processData = async function processData(experimentName) {
  const positionData = await PositionData.findAll({
    where: { experimentName },
    include: { model: Point }
  })
  const processedData = errors(positionData)
  const experimentPrimaryMetrics = primaryMetrics(processedData, positionData, experimentName)
  await updatePositionDataErrors(processedData, experimentName)
  await upsertPrimaryMetrics(experimentPrimaryMetrics)
}

exports.updatePositionDataErrors = updatePositionDataErrors
exports.processData = processData
