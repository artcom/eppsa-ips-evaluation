const Experiment = require("../models/experiment")
const NodePosition = require("../models/nodePosition")
const nodePositions1 = require("../../data/nodePositions1.json")
const nodePositions2 = require("../../data/nodePositions2.json")
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
      await NodePosition.bulkCreate(nodePositions1)
      break
    case "test_quuppa":
      await NodePosition.bulkCreate(nodePositions2)
  }
}
