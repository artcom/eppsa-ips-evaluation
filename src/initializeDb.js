const Experiment = require("./models/experiment")
const ExperimentMetrics = require("./models/experimentMetrics")
const Node = require("./models/node")
const NodePosition = require("./models/nodePosition")
const Point = require("./models/point")
const PositionData = require("./models/positionData")
const Zone = require("./models/zone")
const ZoneSet = require("./models/zoneSet")


exports.initializeDb = async function initializeDb() {
  await Experiment.sync()
  await Point.sync()
  await Node.sync()
  await NodePosition.sync()
  await PositionData.sync()
  await ExperimentMetrics.sync()
  await ZoneSet.sync()
  await Zone.sync()
}
