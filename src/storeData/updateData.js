const { intersection, isEqual, mean } = require("lodash")
const Point = require("../models/point")
const PositionData = require("../models/positionData")
const storeData = require("../storeData")
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
  await Promise.all(positions.map(async position => await storeData.upsertZoneAccuracy({
    accuracy: isEqual(position.estZone, position.trueZone),
    positionDatumId: position.id,
    zoneSetName: set
  })))
}

exports.experimentZoneAccuracy = async function experimentZoneAccuracy(experimentName) {
  const zoneSets = await ZoneSet.findAll()
  const zoneSetNames = zoneSets.map(set => set.name)
  await Promise.all(zoneSetNames.map(async zoneSetName => {
    const zoneAccuracies = await ZoneAccuracy.findAll(
      {
        include: [
          { model: PositionData, where: { experimentName } },
          { model: ZoneSet, where: { name: zoneSetName } }
        ]
      }
    )
    const accuracyAverage = mean(zoneAccuracies.map(point => point.accuracy ? 1 : 0))
    await storeData.upsertExperimentZoneAccuracy({ experimentName, zoneSetName, accuracyAverage })
  }))
}
