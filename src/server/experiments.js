const multer = require("multer")
const { getExperiments, getExperimentByName } = require("../getData")
const { insertExperiment } = require("../storeData/index")


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

  return server
}
