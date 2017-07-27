const { describe, it } = require("mocha")
const { getMockData } = require("../mocks/getExperimentalData")
const { initializeDb } = require("../../src/initializeDb")
const nodePositions = require("../testData/nodePositions.json")
const points = require("../testData/points.json")
const { processData } = require("../../src/storeData/processExperimentalData")
const { setUpExperiment, setUpNodePositions, setUpPoints } = require("../../src/setUpExperiment")


describe("Run an experiment", () => {
  it("is pending")
})

async function setUpDb() {
  await initializeDb()
  await setUpPoints(points)
}

async function runExperiment(experimentName) {
  await setUpDb()
  await setUpExperiment(experimentName)
  await setUpNodePositions(nodePositions)
  await getMockData()
  await processData(experimentName)
}
