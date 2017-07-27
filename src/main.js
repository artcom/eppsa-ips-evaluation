const { getDataForAllTags } = require("./getExperimentalData/getQuuppaData")
const { initializeDb } = require("./initializeDb")
const nodePositionsQuuppa = require("../data/nodePositionsQuuppa.json")
const points = require("../data/points.json")
const { processData } = require("./storeData/processExperimentalData")
const { setUpExperiment, setUpNodePositions, setUpPoints } = require("./setUpExperiment")


async function setUpDb() {
  await initializeDb()
  await setUpPoints(points)
}

async function runQuuppaExperiment(experimentName) {
  await setUpDb()
  await setUpExperiment(experimentName)
  await setUpNodePositions(nodePositionsQuuppa)
  await getDataForAllTags(experimentName)
  await processData(experimentName)
}

runQuuppaExperiment("test_quuppa")
