const Experiment = require("../models/experiment")
const NodePosition = require("../models/nodePosition")
const nodePositionsMock = require("../../data/nodePositionsMock.json")
const nodePositionsQuuppa = require("../../data/nodePositionsQuuppa.json")
const Point = require("../models/point")

exports.setUpPoints = async function setUpPoints(points) {
  await Point.bulkCreate(points)
}

exports.setUpExperiment = async function setUpExperiment(experimentName) {
  await Experiment.create({ name: experimentName })
}

exports.setUpNodePositions = async function setUpNodePositions(experimentName) {
  switch (experimentName) {
    case "test_mock":
      await NodePosition.bulkCreate(nodePositionsMock)
      break
    case "test_quuppa":
      await NodePosition.bulkCreate(nodePositionsQuuppa)
  }
}
