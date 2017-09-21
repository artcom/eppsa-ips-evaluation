const { processData } = require("../storeData/processExperimentalData")
const { getDataForAllNodes } = require("../getExperimentalData/getGoIndoorData")


exports.runGoIndoorExperiment = async function runGoIndoorExperiment(experimentName) {
  await getDataForAllNodes(experimentName)
  await processData(experimentName)
}
