const Experiment = require("../models/experiment")
const Point = require("../models/point")
const { updatePointZones, updateAllPositionDataZones } = require("./index")
const { processData } = require("./processExperimentalData")


async function correctPoint(point) {
  const experiments = await Experiment.findAll()
  await Point.update(point, { where: { name: point.name } })
  await updatePointZones(point)
  await updateAllPositionDataZones()
  await Promise.all(experiments.map(async experiment => {
    await processData(experiment.name)
  }))
}

const point = {
  name: "H",
  trueCoordinateX: 10.20,
  trueCoordinateY: 7.29,
  trueCoordinateZ: 1.20
}

correctPoint(point).then(() => {
  console.log(`corrected point ${point.name}`)
})
