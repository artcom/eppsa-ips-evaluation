const express = require("express")
const { pick } = require("lodash")
const multer = require("multer")
const Experiment = require("./models/experiment")
const { setUpExperiment } = require("./setUpExperiment")


const server = express()
const upload = multer()

const getExperiments = async function getExperiments() {
  const experiments = await Experiment.findAll()
  const processedExperiments = experiments.map(experiment => pick(experiment, ["name"]))
  console.log(processedExperiments)
  return processedExperiments
}

const getExperimentByName = async function getExperimentByName(name) {
  const experiment = await Experiment.findAll({ name })
  return experiment[0].name
}

server.get("/", (req, res) => res.send(""))

server.get("/experiments", (req, res) =>
  getExperiments()
    .then(experiments =>
      res.send(experiments)
    )
)

server.post("/experiments", upload.array(), (req, res) => {
  setUpExperiment(req.body.name).then(() => {
    res.status(201).send(req.body.name)
  })
})

server.get("/experiments/:name", (req, res) =>
  getExperimentByName(req.params.name)
    .then(experiments =>
      res.send(experiments)
    )
)

module.exports = server
