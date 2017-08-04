const Experiment = require("../models/experiment")
const ExperimentMetrics = require("../models/experimentMetrics")
const Node = require("../models/node")
const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")
const PositionData = require("../models/positionData")


const upsertNodePosition = async function upsertNodePosition(nodePosition) {
  const sameNodes = await NodePosition.findAll({
    where: {
      localizedNodeId: nodePosition.localizedNodeId,
      experimentName: nodePosition.experimentName
    }
  })
  if (sameNodes.length === 0) {
    await NodePosition.create(nodePosition)
  } else {
    await NodePosition.update(nodePosition, {
      where: {
        localizedNodeId: nodePosition.localizedNodeId,
        experimentName: nodePosition.experimentName
      }
    })
  }
}

const upsertPrimaryMetrics = async function upsertPrimaryMetrics(primaryMetrics) {
  const present = await ExperimentMetrics.findAll({
    where: {
      experimentName: primaryMetrics.experimentName
    }
  })
  if (present.length === 0) {
    await ExperimentMetrics.create(primaryMetrics)
  } else {
    await ExperimentMetrics.update(primaryMetrics, {
      where: {
        experimentName: primaryMetrics.experimentName
      }
    })
  }
}

exports.insertNode = async function insertNode(node) {
  await Node.create(node)
}

exports.insertNodes = async function insertNodes(nodes) {
  await Node.bulkCreate(nodes)
}

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

exports.upsertNodePositions = async function upsertNodePositons(nodePositions) {
  await Promise.all(nodePositions.map(upsertNodePosition))
}

exports.upsertNodePosition = upsertNodePosition

exports.insertPositionData = async function insertPositionData(positionData) {
  await PositionData.bulkCreate(positionData)
}

exports.insertPrimaryMetrics = async function insertPrimaryMetrics(primaryMetrics) {
  await ExperimentMetrics.create(primaryMetrics)
}

exports.upsertPrimaryMetrics = upsertPrimaryMetrics
