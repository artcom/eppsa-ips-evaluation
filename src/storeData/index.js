const Experiment = require("../models/experiment")
const ExperimentMetrics = require("../models/experimentMetrics")
const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")
const PositionData = require("../models/positionData")

exports.insertPoints = async function insertPoints(points) {
  await Point.bulkCreate(points)
}

exports.insertPoint = async function insertPoint(point) {
  await Point.create(point)
}

exports.insertExperiment = async function insertExperiment(experimentName) {
  await Experiment.create({ name: experimentName })
}

exports.insertNodePositions = async function insertNodePositions(nodePositions) {
  await NodePosition.bulkCreate(nodePositions)
}

exports.insertNodePosition = async function insertNodePosition(nodePosition) {
  await NodePosition.create(nodePosition)
}

exports.insertPositionData = async function insertPositionData(positionData) {
  await PositionData.bulkCreate(positionData)
}

exports.insertPrimaryMetrics = async function insertPrimaryMetrics(primaryMetrics) {
  await ExperimentMetrics.create(primaryMetrics)
}
