const multer = require("multer")
const { includes } = require("lodash")
const { getExperiments, getExperimentByName } = require("../getData")
const { insertExperiment } = require("../storeData/index")
const QuuppaExperiment = require("../runExperiment/quuppaExperiment")


const upload = multer()

module.exports = function serveExperiments(server) {
  server.get("/", (request, response) => response.send(""))

  server.get("/experiments", async (request, response) => {
    const experiments = await getExperiments()
    response.send(experiments)
  })

  server.post("/experiments", upload.array(), async (request, response) => {
    await insertExperiment(request.body.name)
    response
      .append("location", `/experiments/${request.body.name}`)
      .status(201)
      .send(request.body.name)
  })

  server.get("/experiments/:name", async (request, response) => {
    const experiments = await getExperimentByName(request.params.name)
    response.json(experiments)
  })

  server.post("/experiments/:name/run", async (request, response) => {
    const { experimentTypes, repeats, interval } = request.body
    const quuppaExperiment = new QuuppaExperiment(request.params.name)
    if (includes(experimentTypes, "Quuppa")) {
      repeat(() => quuppaExperiment.run(), repeats, interval)
    }
    response.status(201).send(`started ${experimentTypes.join(", ")} experiment`)
  })

  return server
}

function repeat(func, repeats = 1, interval = 0) {
  func()
  let count = 1
  const intervalId = setInterval(() => {
    count++
    if (count > repeats) {
      clearInterval(intervalId)
    } else {
      func()
    }
  }, interval)
}
