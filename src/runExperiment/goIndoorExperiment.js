const { processData } = require("../storeData/processExperimentalData")
const { getDataForAllNodes } = require("../getExperimentalData/getGoIndoorData")


module.exports = async function runGoIndoorExperiment(experimentName) {
  await getDataForAllNodes(experimentName)
  await processData(experimentName)
}
