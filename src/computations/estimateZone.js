const { inRange } = require("lodash")
const Zone = require("../models/zone")


exports.estimateZone = async function estimateZone(x, y, z) {
  const zones = await Zone.findAll()
  for (const zone of zones) {
    if (
      inRange(x, zone.xMin, zone.xMax)
      && inRange(y, zone.yMin, zone.yMax)
      && inRange(z, zone.zMin, zone.zMax)
    ) {
      return zone.name
    }
  }
  return null
}

exports.getZones = async function getZones(x, y, z) {
  const zones = await Zone.findAll()
  const containingZones = []
  for (const zone of zones) {
    if (
      inRange(x, zone.xMin, zone.xMax)
      && inRange(y, zone.yMin, zone.yMax)
      && inRange(z, zone.zMin, zone.zMax)
    ) {
      containingZones.push(zone.name)
    }
  }
  return containingZones
}
