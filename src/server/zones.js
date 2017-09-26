const multer = require("multer")
const { keys } = require("lodash")
const { getZones, getZoneByName } = require("../getData")
const storeData = require("../storeData")
const Zone = require("../models/zone")


const upload = multer()

module.exports = function serveZones(server) {
  server.get("/zones", async (request, response) => {
    const zones = await getZones()
    response.status(200).send(zones)
  })

  server.get("/zones/:name", async (request, response) => {
    const zone = await getZoneByName(request.params.name)
    response.status(200).send(zone)
  })

  server.post("/zones", upload.array(), async (request, response) => {
    if (request.body["0"]) {
      const zones = keys(request.body).map(key => request.body[key])
      await storeData.insertZones(zones)

      response
        .append("location", zones.map(zone => `/zones/${zone.name}`).join("; "))
        .status(201)
        .send(zones.map(zone => zone.name))
    } else {
      await storeData.insertZone(request.body)
      response.append("location", `/zones/${request.body.name}`).status(201).send(request.body.name)
    }
  })

  server.delete("/zones/:name", async (request, response) => {
    await Zone.destroy({ where: { name: request.params.name } })
    await storeData.updatePointsZones()
    response.send(request.params.name)
  })

  return server
}
