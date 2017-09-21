const getQuuppaData = require("../getExperimentalData/getQuuppaData")
const { processData } = require("../storeData/processExperimentalData")


module.exports = async function runQuuppaExperiment(experimentName) {
  const response = await getQuuppaData.getQuuppaData()
  await getQuuppaData.getDataForAllNodes(experimentName, response)
  await processData(experimentName)
}
