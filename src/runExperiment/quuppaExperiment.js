const getQuuppaData = require("../getExperimentalData/getQuuppaData")
const { processData } = require("../storeData/processExperimentalData")


module.exports = async function runQuuppaExperiment(experimentName) {
  console.error("starting experiment")
  const response = await getQuuppaData.getQuuppaData()
  await getQuuppaData.getDataForAllTags(experimentName, response)
  await processData(experimentName)
}
