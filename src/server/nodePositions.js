const { assign } = require("lodash")
const NodePositon = require("../models/nodePosition")


const getNodePositions = async function getNodePositions(experimentName) {
  return await NodePositon.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { experimentName }
  })
}

const getNodePositionsByNodeId = async function getNodePositions(nodeId, experimentName) {
  return await NodePositon.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "id"
      ]
    },
    where: { localizedNodeId: nodeId, experimentName }
  })
}

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

  server.post("/experiments/:experimentName/node-positions", async (request, response) => {
    const experimentName = request.params.experimentName
    const nodeId = request.body.localizedNodeId
    await NodePositon.create(
      assign(request.body, { experimentName })
    )
    response
      .append("location", `/experiments/${experimentName}/node-positions/${nodeId}`)
      .status(201)
      .send(nodeId)
  })

  return server
}

exports.serveNodePositions = serveNodePositions
