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
  server.get("/", (request, response) => response.send(""))

  server.get("/experiments", async (request, response) => {
    const experiments = await getExperiments()
    response.send(experiments)
  })

  server.post("/experiments", upload.array(), async (request, response) => {
    await setUpExperiment(request.body.name)
    response
      .append("location", `/experiments/${request.body.name}`)
      .status(201)
      .send(request.body.name)
  })

  server.get("/experiments/:name", async (request, response) => {
    const experiments = await getExperimentByName(request.params.name)
    response.json(experiments)
  })

  return server
}

exports.getExperiments = getExperiments
exports.getExperimentByName = getExperimentByName
exports.serveExperiments = serveExperiments
