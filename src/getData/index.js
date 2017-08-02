const { pick } = require("lodash")
const Experiment = require("../models/experiment")
const NodePositon = require("../models/nodePosition")
const Point = require("../models/point")
const PositionData = require("../models/positionData")


exports.getExperiments = async function getExperiments() {
  const experiments = await Experiment.findAll()
  return experiments.map(experiment => pick(experiment, ["name"]))
}

exports.getExperimentByName = async function getExperimentByName(name) {
  const experiment = await Experiment.findAll({ name })
  return pick(experiment[0], ["name"])
}

exports.getPoints = async function getPoints() {
  return await Point.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt"
      ]
    }
  })
}

exports.getPointsByName = async function getPointsByName(name) {
  return await Point.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt"
      ]
    },
    where: { name }
  })
}

exports.getNodePositions = async function getNodePositions(experimentName) {
  return await NodePositon.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { experimentName }
  })
}

exports.getNodePositionsByNodeId = async function getNodePositions(nodeId, experimentName) {
  return await NodePositon.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { localizedNodeId: nodeId, experimentName }
  })
}

exports.getPositionDataByExperiment = async function getPositionDataByExperiment(experimentName) {
  return await PositionData.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { experimentName }
  })
}
