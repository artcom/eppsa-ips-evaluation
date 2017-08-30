const { inRange } = require("lodash")
const Zone = require("../models/zone")


const estimateZone = async function estimateZone(x, y, z) {
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
  return "NA"
}

module.exports = estimateZone
