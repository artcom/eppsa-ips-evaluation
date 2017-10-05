const multer = require("multer")
const { getZoneSets, getZoneSetByName } = require("../getData")
const storeData = require("../storeData")
const ZoneSet = require("../models/zoneSet")


const upload = multer()

module.exports = function serveZoneSets(server) {
  server.get("/zone-sets", async (request, response) => {
    const zoneSets = await getZoneSets()
    response.status(200).send(zoneSets)
  })

  server.get("/zone-sets/:zoneSetName", async (request, response) => {
    const zoneSet = await getZoneSetByName(request.params.zoneSetName)
    response.status(200).send(zoneSet)
  })

  server.post("/zone-sets", upload.array(), async (request, response) => {
    const name = request.body.name
    await ZoneSet.create({ name })
    response
      .append("location", `/zone-sets/${name}`)
      .status(201)
      .send(name)
  })

  server.post("/zone-sets/:zoneSetName", async (request, response) => {
    const zoneSetName = request.params.zoneSetName
    const zoneName = request.body.zoneName
    await storeData.addZonesToSet(zoneSetName, [zoneName])
    response
      .append("location", `/zone-sets/${zoneSetName}/${zoneName}`)
      .status(201).send({ zoneSetName, zoneName })
  })

  return server
}
