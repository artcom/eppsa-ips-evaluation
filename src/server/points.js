const Point = require("../models/point")


const getPoints = async function getPoints() {
  return await Point.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt"
      ]
    }
  })
}

const getPointsByName = async function getPointsByName(name) {
  return await Point.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt"
      ]
    },
    where: { name }
  })
}

const servePoints = function servePoints(server) {
  server.get("/points", async (request, response) => {
    const points = await getPoints()
    response.status(200).send(points)
  })

  server.get("/points/:name", async (request, response) => {
    const point = await getPointsByName(request.params.name)
    response.status(200).send(point)
  })

  server.post("/points", async (request, response) => {
    await Point.create(request.body)
    response.append("location", `/points/${request.body.name}`).status(201).send(request.body.name)
  })

  return server
}

exports.servePoints = servePoints
