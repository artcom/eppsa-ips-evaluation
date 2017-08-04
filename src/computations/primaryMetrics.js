const { mean, min, max, variance, median, rootMeanSquare } = require("simple-statistics")

const percentile = function percentile(arr, p) {
  if (arr.length === 0) { return 0 }
  if (p <= 0) { return arr[0] }
  if (p >= 1) { return arr[arr.length - 1] }

  arr.sort((a, b) => a - b)
  const index = (arr.length - 1) * p
  const lower = Math.floor(index)
  const upper = lower + 1
  const weight = index % 1

  if (upper >= arr.length) { return arr[lower] }
  return arr[lower] * (1 - weight) + arr[upper] * weight
}

const primaryMetrics = function primaryMetrics(processedData, data, experimentName) {
  const error2d = processedData.map(processedDatum => processedDatum.localizationError2d)
  const error3d = processedData.map(processedDatum => processedDatum.localizationError3d)
  const latency = data.map(datum => datum.latency)
  const powerConsumption = data.map(datum => datum.powerConsumption)
  return {
    experimentName,
    error2dAverage: mean(error2d),
    error2dMin: min(error2d),
    error2dMax: max(error2d),
    error2dVariance: variance(error2d),
    error2dMedian: median(error2d),
    error2dRMS: rootMeanSquare(error2d),
    error2dPercentile75: percentile(error2d, 0.75),
    error2dPercentile90: percentile(error2d, 0.9),
    error3dAverage: mean(error3d),
    error3dMin: min(error3d),
    error3dMax: max(error3d),
    error3dVariance: variance(error3d),
    error3dMedian: median(error3d),
    error3dRMS: rootMeanSquare(error3d),
    error3dPercentile75: percentile(error3d, 0.75),
    error3dPercentile90: percentile(error3d, 0.9),
    zoneAccuracyAverage: mean(processedData.map(processedDatum => processedDatum.zoneAccuracy)),
    latencyAverage: mean(latency),
    latencyMin: min(latency),
    latencyMax: max(latency),
    latencyVariance: variance(latency),
    latencyMedian: median(latency),
    latencyRMS: rootMeanSquare(latency),
    latencyPercentile75: percentile(latency, 0.75),
    latencyPercentile90: percentile(latency, 0.9),
    powerConsumptionAverage: mean(powerConsumption),
    powerConsumptionMin: min(powerConsumption),
    powerConsumptionMax: max(powerConsumption),
    powerConsumptionVariance: variance(powerConsumption),
    powerConsumptionMedian: median(powerConsumption),
    powerConsumptionRMS: rootMeanSquare(powerConsumption),
    powerConsumptionPercentile75: percentile(powerConsumption, 0.75),
    powerConsumptionPercentile90: percentile(powerConsumption, 0.9)
  }
}

exports.primaryMetrics = primaryMetrics
exports.percentile = percentile
