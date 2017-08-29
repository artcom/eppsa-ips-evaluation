const multer = require("multer")
const { keys } = require("lodash")
const { getNodes, getNodesById } = require("../getData")
const Node = require("../models/node")


const upload = multer()

module.exports = function serveNodes(server) {
  server.get("/nodes", async (request, response) => {
    const nodes = await getNodes()
    response.status(200).send(nodes)
  })

  server.get("/nodes/:id", async (request, response) => {
    const node = await getNodesById(request.params.id)
    response.status(200).send(node)
  })

  server.post("/nodes", upload.array(), async (request, response) => {
    await Node.create(request.body)
    response.append("location", `/nodes/${request.body.id}`).status(201).send(request.body.id)
  })

  server.post("/nodes/bulk", upload.array(), async (request, response) => {
    const nodes = keys(request.body).map(key => request.body[key])
    await Node.bulkCreate(nodes)

    response
      .append("location", nodes.map(node => `/nodes/${node.id}`).join("; "))
      .status(201)
      .send(nodes.map(node => node.id))
  })

  return server
}
