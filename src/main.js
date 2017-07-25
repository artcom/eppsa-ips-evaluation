const getDataForAllTags = require("./getExperimentalData/getQuuppaData")
const { initializeDb } = require("./initializeDb")
const { insertMockPositionData } = require("./mocks")
const nodePositions1 = require("../data/nodePositions1.json")
const nodePositions2 = require("../data/nodePositions2.json")
const points = require("../data/points.json")
const processData = require("./storeData/processExperimentalData")
const { setUpExperiment, setUpNodePositions, setUpPoints } = require("./setUpExperiment")


async function setUpDb() {
  await initializeDb()
  await setUpPoints(points)
}

async function runMockExperiment() {
  await setUpDb()
  await setUpExperiment("test_1")
  await setUpNodePositions(nodePositions1)
  await insertMockPositionData()
  await processData("test_1")
}

async function runQuuppaExperiment() {
  await setUpDb()
  await setUpExperiment("test_2")
  await setUpNodePositions(nodePositions2)
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
