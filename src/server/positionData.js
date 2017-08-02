const { getPositionDataByExperiment } = require("../getData")


module.exports = function servePositionData(server) {
  server.get("/experiments/:name/position-data", async (request, response) => {
    const positionData = await getPositionDataByExperiment(request.params.name)
    response.status(200).send(positionData)
  })

  return server
}
