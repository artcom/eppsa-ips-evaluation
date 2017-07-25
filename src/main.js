const getDataForAllTags = require("./getExperimentalData/getQuuppaData")
const { initializeDb } = require("./initializeDb")
const { insertMockPositionData } = require("./mocks")
const nodePositions = require("../data/nodePositions.json")
const points = require("../data/points.json")
const processData = require("./storeData/processExperimentalData")
const { setUpNodePositions, setUpPoints } = require("./setUpExperiment")


initializeDb()
  .then(() => setUpPoints(points)
    .then(() => setUpNodePositions(nodePositions)
      .then(() => insertMockPositionData()
        .then(() => processData("test_1")
          .then()
        )
      )
    )
  )
  .catch(error => console.error(error))


getDataForAllTags("test_2")
