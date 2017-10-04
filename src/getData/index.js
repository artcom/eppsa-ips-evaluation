const { pick, sortBy } = require("lodash")
const Experiment = require("../models/experiment")
const ExperimentMetrics = require("../models/experimentMetrics")
const Node = require("../models/node")
const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const Zone = require("../models/zone")
const ZoneSet = require("../models/zoneSet")


exports.getExperiments = async function getExperiments() {
  const experiments = await Experiment.findAll()
  return experiments.map(experiment => pick(experiment, ["name"]))
}

exports.getExperimentByName = async function getExperimentByName(name) {
  const experiment = await Experiment.findAll({ where: { name } })
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

exports.getPointByName = async function getPointByName(name) {
  const queryResult = await Point.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt"
      ]
    },
    where: { name }
  })
  return queryResult[0]
}

exports.getNodes = async function getNodes() {
  return await Node.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt"
      ]
    }
  })
}

exports.getNodeByName = async function getNodeByName(name) {
  const queryResult = await Node.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt"
      ]
    },
    where: { name }
  })
  return queryResult[0]
}

exports.getZones = async function getZones() {
  return await Zone.findAll({
    attributes: {
      exclude: [
        "id",
        "createdAt",
        "updatedAt"
      ]
    }
  })
}

exports.getZoneByName = async function getZones(name) {
  const queryResult = await Zone.findAll({
    attributes: {
      exclude: [
        "id",
        "createdAt",
        "updatedAt"
      ]
    },
    where: { name }
  })
  return queryResult[0]
}

exports.getZoneSets = async function getZoneSets() {
  return await ZoneSet.findAll({ include: [{ model: Zone }] })
    .map(zoneSet => (
      {
        name: zoneSet.name,
        zones: sortBy(zoneSet.zones.map(zone =>
          pick(zone, ["name", "xMax", "xMin", "yMax", "yMin", "zMax", "zMin"])
        ), ["name"])
      })
    )
}

exports.getNodePositions = async function getNodePositions(experimentName) {
  return await NodePosition.findAll({
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

exports.getNodePositionByNodeName = async function getNodePositionByNodeName(
  nodeName,
  experimentName
) {
  const queryResult = await NodePosition.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { localizedNodeName: nodeName, experimentName }
  })
  return queryResult[0]
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

exports.getPositionDataByPoint = async function getPositionDataByPoint(pointName) {
  return await PositionData.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { pointName }
  })
}

exports.getPositionDataByNode = async function getPositionDataByNode(nodeName) {
  return await PositionData.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { localizedNodeName: nodeName }
  })
}

exports.getExperimentMetricsByName = async function getExperimentMetricsByName(experimentName) {
  const metrics = await ExperimentMetrics.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { experimentName }
  })
  return metrics[0]
}
