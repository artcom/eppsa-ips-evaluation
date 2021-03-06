const multer = require("multer")
const { keys } = require("lodash")
const { getPoints, getPointByName, getPositionDataByPoint } = require("../getData")
const Point = require("../models/point")
const { insertPoint, insertPoints } = require("../storeData")


const upload = multer()

module.exports = function servePoints(server) {
  server.get("/points", async (request, response) => {
    const points = await getPoints()
    response.status(200).send(points)
  })

  server.get("/points/:name", async (request, response) => {
    const point = await getPointByName(request.params.name)
    response.status(200).send(point)
  })

  server.post("/points", upload.array(), async (request, response) => {
    if (request.body["0"]) {
      const points = keys(request.body).map(key => request.body[key])
      await insertPoints(points)
      response
        .append("location", points.map(point => `/points/${point.name}`).join("; "))
        .status(201)
        .send(points.map(point => point.name))
    } else {
      await insertPoint(request.body)
      response
        .append("location", `/points/${request.body.name}`)
        .status(201)
        .send(request.body.name)
    }
  })

  server.delete("/points/:name", async (request, response) => {
    const positionData = await getPositionDataByPoint(request.params.name)
    if (positionData.length === 0) {
      await Point.destroy({ where: { name: request.params.name } })
      response.send(request.params.name)
    } else {
      response
        .send(`Point "${request.params.name}" has associated experimental data and was not deleted`)
    }
  })

  return server
}
