const express = require("express")
const bodyParser = require("body-parser")
const serveExperiments = require("./experiments")
const serveExperimentMetrics = require("./experimentMetrics")
const servePoints = require("./points")
const serveNodes = require("./nodes")
const serveNodePositions = require("./nodePositions")
const servePositionData = require("./positionData")
const serveZones = require("./zones")


let server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server.all("*", (req, res, next) => {
  if (!req.get("Origin")) {
    return next()
  }

  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "GET,POST,DELETE")
  res.set("Access-Control-Allow-Headers", "X-Requested-With,Content-Type")

  if (req.method === "OPTIONS") {
    return res.send(200)
  }

  next()
})

server = serveExperiments(server)
server = servePoints(server)
server = serveNodes(server)
server = serveZones(server)
server = serveNodePositions(server)
server = servePositionData(server)
server = serveExperimentMetrics(server)

module.exports = server
