const { intersection, isEqual } = require("lodash")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const Zone = require("../models/zone")
const ZoneAccuracy = require("../models/zoneAccuracy")
const ZoneSet = require("../models/zoneSet")


exports.zoneAccuracy = async function zoneAccuracy(set) {
  const positionData = await PositionData.findAll({ include: [
    { model: Zone, as: "EstZone" },
    { model: Point, include: { model: Zone } }
  ] })
  const zoneSet = await ZoneSet.findOne({ where: { name: set }, include: [{ model: Zone }] })
  const zoneSetZoneNames = zoneSet.zones.map(zone => zone.name)
  const positions = positionData.map(positionDatum => ({
    id: positionDatum.id,
    estZone: intersection(zoneSetZoneNames, positionDatum.EstZone.map(zone => zone.name)),
    trueZone: intersection(zoneSetZoneNames, positionDatum.point.zones.map(zone => zone.name))
  }))
  await Promise.all(positions.map(async position => await ZoneAccuracy.create({
    accuracy: isEqual(position.estZone, position.trueZone),
    positionDatumId: position.id,
    zoneSetName: set
  })))
}
