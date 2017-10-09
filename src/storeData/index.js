const { pick } = require("lodash")
const Experiment = require("../models/experiment")
const ExperimentMetrics = require("../models/experimentMetrics")
const ExperimentZoneAccuracy = require("../models/experimentZoneAccuracy")
const NodePosition = require("../models/nodePosition")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const { getZones } = require("../computations/estimateZone")
const updateData = require("./updateData")
const ZoneAccuracy = require("../models/zoneAccuracy")
const Zone = require("../models/zone")
const ZoneSet = require("../models/zoneSet")


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

exports.upsertExperimentZoneAccuracy = async function upsertExperimentZoneAccuracy(zoneAccuracy) {
  const { zoneSetName, experimentName } = zoneAccuracy
  const present = await ExperimentZoneAccuracy.findAll({ where: { zoneSetName, experimentName } })
  if (present.length === 0) {
    await ExperimentZoneAccuracy.create(zoneAccuracy)
  } else {
    await ExperimentZoneAccuracy.update(zoneAccuracy, { where: { zoneSetName, experimentName } })
  }
}

exports.upsertZoneAccuracy = async function upsertZoneAccuracy(zoneAccuracy) {
  const { zoneSetName, positionDatumId } = zoneAccuracy
  const present = await ZoneAccuracy.findAll({ where: { zoneSetName, positionDatumId } })
  if (present.length === 0) {
    await ZoneAccuracy.create(zoneAccuracy)
  } else {
    await ZoneAccuracy.update(zoneAccuracy, { where: { zoneSetName, positionDatumId } })
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
  const zoneSets = await ZoneSet.findAll()
  const sets = zoneSets.map(set => set.name)
  await Promise.all(sets.map(async set => await updateData.zoneAccuracy(set)))
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

exports.addZonesToSet = async function addZonesToSet(set, zones) {
  const zoneSet = await ZoneSet.findOne({ where: { name: set } })
  await zoneSet.addZone(zones)
  await updateData.zoneAccuracy(set)
  const experiments = await Experiment.findAll().map(experiment => experiment.name)
  await Promise.all(experiments.map(async experiment => {
    await updateData.experimentZoneAccuracy(experiment)
  }))
}

exports.removeZonesFromSet = async function removeZonesFromSet(set, zones) {
  const zoneSet = await ZoneSet.findOne({ where: { name: set } })
  await zoneSet.removeZone(zones)
  await updateData.zoneAccuracy(set)
  const experiments = await Experiment.findAll().map(experiment => experiment.name)
  await Promise.all(experiments.map(async experiment => {
    await updateData.experimentZoneAccuracy(experiment)
  }))
}

exports.insertPoint = insertPoint
exports.updatePointZones = updatePointZones
exports.updatePointsZones = updatePointsZones
exports.updatePositionDataZones = updatePositionDataZones
exports.updateAllPositionDataZones = updateAllPositionDataZones
