const multer = require("multer")
const { assign, keys } = require("lodash")
const { getNodePositions, getNodePositionByNodeId } = require("../getData")
const { upsertNodePosition, upsertNodePositions } = require("../storeData")


const upload = multer()

module.exports = function serveNodePositions(server) {
  server.get("/experiments/:experimentName/node-positions", async (request, response) => {
    const nodePositions = await getNodePositions(request.params.experimentName)
    response.status(200).send(nodePositions)
  })

  server.get("/experiments/:experimentName/node-positions/:nodeId", async (request, response) => {
    const nodePositions = await getNodePositionByNodeId(
      request.params.nodeId,
      request.params.experimentName
    )
    response.status(200).send(nodePositions)
  })

  server.post(
    "/experiments/:experimentName/node-positions",
    upload.array(),
    async (request, response) => {
      const experimentName = request.params.experimentName
      if (request.body["0"]) {
        const nodePositions = keys(request.body).map(key => request.body[key])
        const nodeIds = nodePositions.map(nodePosition => nodePosition.localizedNodeId)
        const data = nodePositions.map(nodePosition => assign(nodePosition, { experimentName }))
        await upsertNodePositions(data)
        response
          .append(
            "location",
            nodeIds.map(id => `/experiments/${experimentName}/node-positions/${id}`).join("; ")
          )
          .status(201)
          .send(nodeIds)
      } else {
        const nodeId = request.body.localizedNodeId
        await upsertNodePosition(
          assign(request.body, { experimentName })
        )
        response
          .append("location", `/experiments/${experimentName}/node-positions/${nodeId}`)
          .status(201)
          .send(nodeId)
      }
    }
  )

  return server
}
