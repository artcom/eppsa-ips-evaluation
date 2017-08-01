const multer = require("multer")
const { getPoints, getPointsByName } = require("../getData")
const { insertPoint } = require("../storeData")


const upload = multer()

const servePoints = function servePoints(server) {
  server.get("/points", async (request, response) => {
    const points = await getPoints()
    response.status(200).send(points)
  })

  server.get("/points/:name", async (request, response) => {
    const point = await getPointsByName(request.params.name)
    response.status(200).send(point)
  })

  server.post("/points", upload.array(), async (request, response) => {
    await insertPoint(request.body)
    response.append("location", `/points/${request.body.name}`).status(201).send(request.body.name)
  })

  return server
}

exports.servePoints = servePoints
