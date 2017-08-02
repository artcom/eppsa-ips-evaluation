const express = require("express")
const bodyParser = require("body-parser")
const serveExperiments = require("./experiments")
const serveExperimentMetrics = require("./experimentMetrics")
const servePoints = require("./points")
const serveNodePositions = require("./nodePositions")
const servePositionData = require("./positionData")


let server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server = serveExperiments(server)
server = servePoints(server)
server = serveNodePositions(server)
server = servePositionData(server)
server = serveExperimentMetrics(server)

module.exports = server
