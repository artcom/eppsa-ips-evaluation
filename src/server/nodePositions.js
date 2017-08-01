const multer = require("multer")
const { assign } = require("lodash")
const { getNodePositions, getNodePositionsByNodeId } = require("../getData")
const { insertNodePosition } = require("../storeData")


const upload = multer()

const serveNodePositions = function serveNodePositions(server) {
  server.get("/experiments/:experimentName/node-positions", async (request, response) => {
    const nodePositions = await getNodePositions(request.params.experimentName)
    response.status(200).send(nodePositions)
  })

  server.get("/experiments/:experimentName/node-positions/:nodeId", async (request, response) => {
    const nodePositions = await getNodePositionsByNodeId(
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
      const nodeId = request.body.localizedNodeId
      await insertNodePosition(
        assign(request.body, { experimentName })
      )
      response
        .append("location", `/experiments/${experimentName}/node-positions/${nodeId}`)
        .status(201)
        .send(nodeId)
    }
  )

  return server
}

exports.serveNodePositions = serveNodePositions
