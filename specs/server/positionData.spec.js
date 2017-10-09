const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const rest = require("restling")
const { concat, sortBy, omit, pick } = require("lodash")
const { dbSync, dbDrop } = require("../helpers/db")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const pointErrors = require("../testData/pointErrors.json")
const positions = require("../testData/positionsWithNodesAndPoints.json")
const positionsWithErrors = require("../testData/positionsWithErrors.json")
const server = require("../../src/server")
const { insertExperiment, insertPoints, insertPositionData } = require("../../src/storeData/index")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Server for position data", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await insertPositionData(positionsWithErrors)
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all position data on get at /experiments/experiment-name/position-data",
    async () => {
      const result = await rest.get(
        "http://localhost:3000/experiments/test-experiment/position-data"
      )
      expect(result.response.statusCode).to.equal(200)
      checkPositionData(result.data)
    }
  )
})

function checkPositionData(queryResults) {
  const errorKeys = ["localizationError2d", "localizationError3d"]
  const storedPositionErrors = sortBy(
    queryResults
      .map(queryResult => pick(queryResult, concat(errorKeys, "pointName"))),
    ["pointName"]
  )
  expect(
    sortBy(queryResults, ["pointName"])
      .map(position => omit(position, concat(["latency", "powerConsumption"], errorKeys)))
  ).to.deep.equal(positions)
  for (const storedPosition of storedPositionErrors) {
    const index = storedPositionErrors.indexOf(storedPosition)
    for (const key of errorKeys) {
      expect(storedPosition[key])
        .to.be.closeTo(
        pointErrors[index][key],
        1e-14,
        key
      )
    }
  }
}
