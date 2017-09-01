const { assign, pick } = require("lodash")
const Experiment = require("../models/experiment")
const ExperimentMetrics = require("../models/experimentMetrics")
const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const estimatezone = require("../computations/estimateZone")
const Zone = require("../models/zone")


exports.insertExperiment = async function insertExperiment(experimentName) {
  await Experiment.create({ name: experimentName })
}

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

exports.insertPoints = async function insertPoints(points) {
  const pointsWithZone = await Promise.all(
    points.map(async (point) =>
      assign(
        point,
        {
          trueZoneLabel: await estimatezone(
            point.trueCoordinateX,
            point.trueCoordinateY,
            point.trueCoordinateZ
          )
        }
      )
    )
  )
  await Point.bulkCreate(pointsWithZone)
}

exports.insertPositionData = async function insertPositionData(positions) {
  const positionsWithZone = await Promise.all(
    positions.map(async (position) =>
      assign(
        position,
        {
          estZoneLabel: position.estZoneLabel || await estimatezone(
            position.estCoordinateX,
            position.estCoordinateY,
            position.estCoordinateZ
          )
        }
      )
    )
  )
  await PositionData.bulkCreate(positionsWithZone)
}

exports.insertPoint = async function insertPoint(point) {
  const pointZone = await estimatezone(
    point.trueCoordinateX,
    point.trueCoordinateY,
    point.trueCoordinateZ
  )
  const pointWithZone = await assign(point, { trueZoneLabel: pointZone })
  await Point.create(pointWithZone)
}

const updatePointZones = async function updatePointZones() {
  const points = await Point.findAll()
  const pointsWithZone = await Promise.all(
    points.map(async (point) =>
      assign(
        point,
        {
          trueZoneLabel: await estimatezone(
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

exports.updatePointZones = updatePointZones
