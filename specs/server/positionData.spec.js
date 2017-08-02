const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const restler = require("restler")
const { sortBy } = require("lodash")
const { checkPositionData } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const points = require("../testData/points.json")
const positionData = require("../testData/positionData.json")
const server = require("../../src/server")
const { insertPositionData, insertExperiment, insertPoints } = require("../../src/storeData/index")

describe("Server for points", () => {
  beforeEach(async () => {
    await dbSync()
    await insertExperiment("test-experiment")
    await insertPoints(points)
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return all position data on get at /experiments/experiment-name/position-data",
    done => {
      insertPositionData(positionData).then(
        () => {
          restler.get("http://localhost:3000/experiments/test-experiment/position-data")
            .on("complete", (data, response) => {
              expect(response.statusCode).to.equal(200)
              checkPositionData(sortBy(data, ["pointName"]))
              done()
            })
        }
      )
    }
  )
})
