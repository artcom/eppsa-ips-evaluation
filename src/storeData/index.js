const { assign, pick } = require("lodash")
const config = require("../constants")
const Experiment = require("../models/experiment")
const ExperimentMetrics = require("../models/experimentMetrics")
const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const { estimateZone, getZones } = require("../computations/estimateZone")
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

const insertPoint = async function insertPoint(point) {
  await Point.create(
    pick(
      point,
      ["name", "trueCoordinateX", "trueCoordinateY", "trueCoordinateZ"]
    )
  )
  const zones = await getZones(
    point.trueCoordinateX,
    point.trueCoordinateY,
    point.trueCoordinateZ
  )
  const newPoint = await Point.findOne({ where: { name: point.name } })
  await newPoint.addZones(zones)
}

exports.insertPoints = async function insertPoints(points) {
  await Promise.all(
    points.map(insertPoint)
  )
}

exports.insertPositionData = async function insertPositionData(positions) {
  const positionsWithZone = await Promise.all(
    positions.map(async (position) =>
      assign(
        position,
        {
          estZoneLabel: position.estZoneLabel || await estimateZone(
            position.estCoordinateX,
            position.estCoordinateY,
            position.estCoordinateZ || config.defaultCoordinateZ
          )
        }
      )
    )
  )
  await PositionData.bulkCreate(positionsWithZone)
}

const updatePointZones = async function updatePointZones() {
  const points = await Point.findAll()
  const pointsWithZone = await Promise.all(
    points.map(async (point) =>
      assign(
        point,
        {
          trueZoneLabel: await estimateZone(
            point.trueCoordinateX,
            point.trueCoordinateY,
            point.trueCoordinateZ
          )
        }
      )
    )
  )
  await Promise.all(
    pointsWithZone.map(async (point) => {
      await Point.update(pick(point, ["name", "trueZoneLabel"]), { where: { name: point.name } })
    })
  )
}

exports.insertZones = async function insertZones(zones) {
  await Zone.bulkCreate(zones)
  await updatePointZones()
}

exports.insertZone = async function insertZone(zone) {
  await Zone.create(zone)
  await updatePointZones()
}

exports.insertPoint = insertPoint
exports.updatePointZones = updatePointZones
