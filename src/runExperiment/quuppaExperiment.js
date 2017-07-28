const { getQuuppaData, getDataForAllTags } = require("../getExperimentalData/getQuuppaData")
const { initializeDb } = require("../initializeDb")
const nodePositionsQuuppa = require("../../data/nodePositionsQuuppa.json")
const points = require("../../data/points.json")
const { processData } = require("../storeData/processExperimentalData")
const { setUpExperiment, setUpNodePositions, setUpPoints } = require("../setUpExperiment")


const setUpDb = async function setUpDb() {
  await initializeDb()
  await setUpPoints(points)
}

class QuuppaExperiment {
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
    await setUpDb()
    await setUpExperiment(this.experimentName)
    await setUpNodePositions(nodePositionsQuuppa)
    await this.getDataForAllTags()
    await processData(this.experimentName)
  }
}

exports.setUpDb = setUpDb
exports.QuuppaExperiment = QuuppaExperiment
