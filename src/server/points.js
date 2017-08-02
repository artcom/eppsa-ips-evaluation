const multer = require("multer")
const { keys } = require("lodash")
const { getPoints, getPointsByName } = require("../getData")
const { insertPoint, insertPoints } = require("../storeData")


const upload = multer()

module.exports = function servePoints(server) {
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

  server.post("/points/bulk", upload.array(), async (request, response) => {
    const points = keys(request.body).map(key => request.body[key])
    await insertPoints(points)

    response
      .append("location", points.map(point => `/points/${point.name}`).join("; "))
      .status(201)
      .send(points.map(point => point.name))
  })

  return server
}
