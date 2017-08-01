const express = require("express")
const bodyParser = require("body-parser")
const { serveExperiments } = require("./experiments")


const server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

const experimentServer = serveExperiments(server)

module.exports = experimentServer
