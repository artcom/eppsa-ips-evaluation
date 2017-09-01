const multer = require("multer")
const { keys } = require("lodash")
const { getNodes, getNodesByName } = require("../getData")
const Node = require("../models/node")


const upload = multer()

module.exports = function serveNodes(server) {
  server.get("/nodes", async (request, response) => {
    const nodes = await getNodes()
    response.status(200).send(nodes)
  })

  server.get("/nodes/:name", async (request, response) => {
    const node = await getNodesByName(request.params.name)
    response.status(200).send(node)
  })

  server.post("/nodes", upload.array(), async (request, response) => {
    if (request.body["0"]) {
      const nodes = keys(request.body).map(key => request.body[key])
      await Node.bulkCreate(nodes)

      response
        .append("location", nodes.map(node => `/nodes/${node.name}`).join("; "))
        .status(201)
        .send(nodes.map(node => node.name))
    } else {
      await Node.create(request.body)
      response.append("location", `/nodes/${request.body.name}`).status(201).send(request.body.name)
    }
  })

  return server
}
