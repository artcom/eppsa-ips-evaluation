const Experiment = require("../models/experiment")
const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")

exports.setUpPoints = async function setUpPoints(points) {
  await Point.bulkCreate(points)
}

exports.setUpExperiment = async function setUpExperiment(experimentName) {
  await Experiment.create({ name: experimentName })
}

exports.setUpNodePositions = async function setUpNodePositions(nodePositions) {
  await NodePosition.bulkCreate(nodePositions)
}
