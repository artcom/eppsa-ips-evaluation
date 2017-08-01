const { pick } = require("lodash")
const multer = require("multer")
const Experiment = require("../models/experiment")
const { setUpExperiment } = require("../setUpExperiment")


const upload = multer()

const getExperiments = async function getExperiments() {
  const experiments = await Experiment.findAll()
  return experiments.map(experiment => pick(experiment, ["name"]))
}

const getExperimentByName = async function getExperimentByName(name) {
  const experiment = await Experiment.findAll({ name })
  return pick(experiment[0], ["name"])
}

const serveExperiments = function serveExperiments(server) {
  server.get("/", (req, res) => res.send(""))

  server.get("/experiments", (req, res) =>
    getExperiments()
      .then(experiments =>
        res.send(experiments)
      )
  )

  server.post("/experiments", upload.array(), (req, res) => {
    setUpExperiment(req.body.name).then(() => {
      res.append("location", `/experiments/${req.body.name}`).status(201).send(req.body.name)
    })
  })

  server.get("/experiments/:name", (req, res) =>
    getExperimentByName(req.params.name)
      .then(experiments =>
        res.json(experiments)
      )
  )

  return server
}

exports.getExperiments = getExperiments
exports.getExperimentByName = getExperimentByName
exports.serveExperiments = serveExperiments
