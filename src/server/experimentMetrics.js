const { getExperimentMetricsByName } = require("../getData")

module.exports = function serveExperimentMetrics(server) {
  server.get("/experiments/:name/primary-metrics", async (request, response) => {
    const experimentMetrics = await getExperimentMetricsByName(request.params.name)
    response.status(200).send(experimentMetrics)
  })

  return server
}
