const getDataForAllTags = require("./getExperimentalData/getQuuppaData")
const { initializeDb } = require("./initializeDb")
const { insertMockPositionData } = require("./mocks")
const nodePositionsMock = require("../data/nodePositionsMock.json")
const nodePositionsQuuppa = require("../data/nodePositionsQuuppa.json")
const points = require("../data/points.json")
const processData = require("./storeData/processExperimentalData")
const { setUpExperiment, setUpNodePositions, setUpPoints } = require("./setUpExperiment")


async function setUpDb() {
  await initializeDb()
  await setUpPoints(points)
}

async function runMockExperiment(experimentName) {
  await setUpDb()
  await setUpExperiment(experimentName)
  await setUpNodePositions(nodePositionsMock)
  await insertMockPositionData(experimentName)
  await processData(experimentName)
}

async function runQuuppaExperiment(experimentName) {
  await setUpDb()
  await setUpExperiment(experimentName)
  await setUpNodePositions(nodePositionsQuuppa)
  await getDataForAllTags(experimentName)
  await processData(experimentName)
}

function runExperiment(type) {
  switch (type) {
    case "Mock":
      runMockExperiment("test_mock").catch(error => console.error(error))
      break
    case "Quuppa":
      runQuuppaExperiment("test_quuppa").catch(error => console.error(error))
  }
}

runExperiment("Mock")
