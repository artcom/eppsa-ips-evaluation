const multer = require("multer")
const { keys } = require("lodash")
const { getZones, getZoneByName } = require("../getData")
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
    await Zone.create(request.body)
    response.append("location", `/zones/${request.body.name}`).status(201).send(request.body.name)
  })

  server.post("/zones/bulk", upload.array(), async (request, response) => {
    const zones = keys(request.body).map(key => request.body[key])
    await Zone.bulkCreate(zones)

    response
      .append("location", zones.map(zone => `/zones/${zone.name}`).join("; "))
      .status(201)
      .send(zones.map(zone => zone.name))
  })

  return server
}
