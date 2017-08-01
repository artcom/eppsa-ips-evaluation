const { getQuuppaData, getDataForAllTags } = require("../getExperimentalData/getQuuppaData")
const { initializeDb } = require("../initializeDb")
const nodePositionsQuuppa = require("../../data/nodePositionsQuuppa.json")
const points = require("../../data/points.json")
const { processData } = require("../storeData/processExperimentalData")
const { insertExperiment, insertNodePositions, insertPoints } = require("../storeData/index")


const setUpDb = async function setUpDb() {
  await initializeDb()
  await insertPoints(points)
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
    await insertExperiment(this.experimentName)
    await insertNodePositions(nodePositionsQuuppa)
    await this.getDataForAllTags()
    await processData(this.experimentName)
  }
}

exports.setUpDb = setUpDb
exports.QuuppaExperiment = QuuppaExperiment
