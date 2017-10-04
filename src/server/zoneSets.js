const { getZoneSets } = require("../getData")


module.exports = function serveZoneSets(server) {
  server.get("/zone-sets", async (request, response) => {
    const zoneSets = await getZoneSets()
    response.status(200).send(zoneSets)
  })

  return server
}
