const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
const { checkPrimaryMetrics } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const points = require("../testData/points.json")
const server = require("../../src/server")
const { insertExperiment, insertPoints } = require("../../src/storeData")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Server for primary metrics", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await ExperimentMetrics.create(experimentPrimaryMetrics)
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return experiment primary metrics on get at " +
    "/experiments/experiment-name/primary-metrics",
    async () => {
      restler.get("http://localhost:3000/experiments/test-experiment/primary-metrics")
        .on("complete", (data, response) => {
          expect(response.statusCode).to.equal(200)
          checkPrimaryMetrics({
            experimentMetrics: data,
            nonPositionData: true,
            isQuery: false
          })
        })
    }
  )
})
