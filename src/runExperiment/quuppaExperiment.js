const { getQuuppaData, getDataForAllTags } = require("../getExperimentalData/getQuuppaData")
const { initializeDb } = require("../initializeDb")
const { processData } = require("../storeData/processExperimentalData")


module.exports = class QuuppaExperiment {
  constructor(name) {
    this.experimentName = name
  }

  async getQuuppaData() {
    return getQuuppaData()
  }

  async getDataForAllTags() {
    const response = await this.getQuuppaData()
    await getDataForAllTags(this.experimentName, response)
  }

  async run() {
    await initializeDb()
    await this.getDataForAllTags()
    await processData(this.experimentName)
  }
}
