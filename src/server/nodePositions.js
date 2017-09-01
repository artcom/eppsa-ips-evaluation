const multer = require("multer")
const { assign, keys } = require("lodash")
const { getNodePositions, getNodePositionByNodeName } = require("../getData")
const { upsertNodePosition, upsertNodePositions } = require("../storeData")


const upload = multer()

module.exports = function serveNodePositions(server) {
  server.get("/experiments/:experimentName/node-positions", async (request, response) => {
    const nodePositions = await getNodePositions(request.params.experimentName)
    response.status(200).send(nodePositions)
  })

  server.get("/experiments/:experimentName/node-positions/:nodeName", async (request, response) => {
    const nodePositions = await getNodePositionByNodeName(
      request.params.nodeName,
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
        const nodeNames = nodePositions.map(nodePosition => nodePosition.localizedNodeName)
        const data = nodePositions.map(nodePosition => assign(nodePosition, { experimentName }))
        await upsertNodePositions(data)
        response
          .append(
            "location",
            nodeNames.map(name =>
              `/experiments/${experimentName}/node-positions/${name}`
            ).join("; ")
          )
          .status(201)
          .send(nodeNames)
      } else {
        const nodeName = request.body.localizedNodeName
        await upsertNodePosition(
          assign(request.body, { experimentName })
        )
        response
          .append("location", `/experiments/${experimentName}/node-positions/${nodeName}`)
          .status(201)
          .send(nodeName)
      }
    }
  )

  return server
}
