const getDataForAllTags = require("./getExperimentalData/getQuuppaData")
const { initializeDb } = require("./initializeDb")
const { insertMockPositionData } = require("./mocks")
const nodePositions = require("../data/nodePositions.json")
const points = require("../data/points.json")
const processData = require("./storeData/processExperimentalData")
const { setUpNodePositions, setUpPoints } = require("./setUpExperiment")


async function setUpDb() {
  await initializeDb()
  await setUpPoints(points)
  await setUpNodePositions(nodePositions)
}

async function insertData() {
  await insertMockPositionData()
  await processData("test_1")
}

async function runMockExperiment() {
  await setUpDb()
  await insertData()
}

async function runQuuppaExperiment() {
  await setUpDb()
  await getDataForAllTags("test_2")
  await processData("test_2")
}

function runExperiment(type) {
  switch (type) {
    case "Mock":
      runMockExperiment().catch(error => console.error(error))
      break
    case "Quuppa":
      runQuuppaExperiment().catch(error => console.error(error))
  }
}

runExperiment("Mock")
