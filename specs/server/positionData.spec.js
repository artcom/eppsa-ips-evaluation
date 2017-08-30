const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const rest = require("restling")
const { sortBy } = require("lodash")
const { checkPositionData } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const Node = require("../../src/models/node")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const PositionData = require("../../src/models/positionData")
const positionData = require("../testData/positionData.json")
const server = require("../../src/server")
const { insertExperiment, insertPoints } = require("../../src/storeData/index")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")

describe("Server for position data", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await PositionData.bulkCreate(positionData)
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
      checkPositionData(sortBy(result.data, ["pointName"]))
    }
  )
})
