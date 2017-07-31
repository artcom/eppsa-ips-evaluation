const express = require("express")
const { pick } = require("lodash")
const Experiment = require("./models/experiment")


const server = express()
const getExperiments = async function getExperiments() {
  const experiments = await Experiment.findAll()
  const processedExperiments = experiments.map(experiment => pick(experiment, ["name"]))
  console.log(processedExperiments)
  return processedExperiments
}

server.get("/", (req, res) => res.send(""))

server.get("/experiments", (req, res) =>
  getExperiments()
    .then(experiments =>
      res.send(experiments)
    )
)

module.exports = server
