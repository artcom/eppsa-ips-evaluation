const Experiment = require("./models/experiment")
const ExperimentMetrics = require("./models/experimentMetrics")
const NodePosition = require("./models/nodePosition")
const Point = require("./models/point")
const PositionData = require("./models/positionData")


exports.initializeDb = async function initializeDb() {
  await Experiment.sync({ force: true })
  await Point.sync({ force: true })
  await NodePosition.sync({ force: true })
  await PositionData.sync({ force: true })
  await ExperimentMetrics.sync({ force: true })
}
