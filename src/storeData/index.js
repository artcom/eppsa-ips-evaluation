const { pick } = require("lodash")
const Experiment = require("../models/experiment")
const ExperimentMetrics = require("../models/experimentMetrics")
const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const { getZones } = require("../computations/estimateZone")
const Zone = require("../models/zone")


exports.insertExperiment = async function insertExperiment(experimentName) {
  await Experiment.create({ name: experimentName })
}

const upsertNodePosition = async function upsertNodePosition(nodePosition) {
  const sameNodes = await NodePosition.findAll({
    where: {
      localizedNodeName: nodePosition.localizedNodeName,
      experimentName: nodePosition.experimentName
    }
  })
  if (sameNodes.length === 0) {
    await NodePosition.create(nodePosition)
  } else {
    await NodePosition.update(nodePosition, {
      where: {
        localizedNodeName: nodePosition.localizedNodeName,
        experimentName: nodePosition.experimentName
      }
    })
  }
}

exports.upsertNodePositions = async function upsertNodePositons(nodePositions) {
  await Promise.all(nodePositions.map(upsertNodePosition))
}

exports.upsertNodePosition = upsertNodePosition

exports.upsertPrimaryMetrics = async function upsertPrimaryMetrics(primaryMetrics) {
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

const updatePointZones = async function updatePointZone(point) {
  const zones = await getZones(
    point.trueCoordinateX,
    point.trueCoordinateY,
    point.trueCoordinateZ
  )
  const newPoint = await Point.findOne({ where: { name: point.name } })
  await newPoint.setZones(zones)
}

const insertPoint = async function insertPoint(point) {
  await Point.create(
    pick(
      point,
      ["name", "trueCoordinateX", "trueCoordinateY", "trueCoordinateZ"]
    )
  )
  await updatePointZones(point)
}

exports.insertPoints = async function insertPoints(points) {
  await Promise.all(
    points.map(insertPoint)
  )
}

const updatePositionDataZones = async function updatePositionDataZones(position, id) {
  const zones = await getZones(
    position.estCoordinateX,
    position.estCoordinateY,
    position.estCoordinateZ
  )
  const newPosition = await PositionData.findById(id)
  await newPosition.setEstZone(zones)
}

const updateAllPositionDataZones = async function updateAllPositionDataZones() {
  const positions = await PositionData.findAll()
  await Promise.all(positions.map(async position => {
    await updatePositionDataZones(position, position.id)
  }))
}

exports.insertPositionData = async function insertPositionData(positions) {
  await Promise.all(positions.map(async position => {
    const createdPosition = await PositionData.create(position)
    await updatePositionDataZones(position, createdPosition.id)
  }))
}

const updatePointsZones = async function updatePointsZones() {
  const points = await Point.findAll()
  await Promise.all(points.map(updatePointZones))
}

exports.insertZones = async function insertZones(zones) {
  await Zone.bulkCreate(zones)
  await updatePointsZones()
  await updateAllPositionDataZones()
}

exports.insertZone = async function insertZone(zone) {
  await Zone.create(zone)
  await updatePointsZones()
  await updateAllPositionDataZones()
}

exports.insertPoint = insertPoint
exports.updatePointZones = updatePointZones
exports.updatePointsZones = updatePointsZones
exports.updatePositionDataZones = updatePositionDataZones
