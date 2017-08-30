const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const proxyquire = require("proxyquire")
const sinon = require("sinon")
const rest = require("restling")
const Experiment = require("../../src/models/experiment")
const { dbSync, dbDrop } = require("../helpers/db")
const { initializeDb } = require("../../src/initializeDb")
const { insertExperiment, insertPoints } = require("../../src/storeData/index")
const getQuuppaData = require("../../src/getExperimentalData/getQuuppaData")
const { getData } = require("../mocks/getExperimentalData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodePositionsSimple = require("../testData/nodePositionsSimple.json")
const nodesSimple = require("../testData/nodesSimple.json")
const points = require("../testData/points.json")
const server = require("../../src/server")
const Zone = require("../../src/models/zone")
const zones = require("../testData/zones.json")


describe("Server for experiments", () => {
  beforeEach(async () => {
    await dbSync()
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    this.server.close()
  })

  it("should return 200 at /", async () => {
    const result = await rest.get("http://localhost:3000")
    expect(result.response.statusCode).to.equal(200)
    expect(result.data).to.equal("")
  })

  it("should return all experiments on get at /experiments", async () => {
    await insertExperiment("test-experiment")
    const result = await rest.get("http://localhost:3000/experiments")
    expect(result.response.statusCode).to.equal(200)
    expect(result.data).to.deep.equal([{ name: "test-experiment" }])
  })

  it("should return experiment name on get at /experiments/experiment-name", async () => {
    await insertExperiment("test-experiment")
    const result = await rest.get("http://localhost:3000/experiments/test-experiment")
    expect(result.response.statusCode).to.equal(200)
    expect(result.data).to.deep.equal({ name: "test-experiment" })
  })

  it("should return experiment name in body and path in location header on post at /experiments",
      async () => {
        const result = await rest.post(
          "http://localhost:3000/experiments",
          { data: { name: "test-experiment" } }
        )
        expect(result.response.statusCode).to.equal(201)
        expect(result.response.headers.location).to.equal("/experiments/test-experiment")
        expect(result.data).to.equal("test-experiment")
      }
  )

  it("should store the experiment in the database on post at /experiments", async () => {
    const result = await rest.post(
      "http://localhost:3000/experiments",
      { data: { name: "test-experiment" } }
    )
    expect(result.response.statusCode).to.equal(201)
    const experiments = await Experiment.findAll()
    expect(experiments[0].name).to.equal("test-experiment")
  })
})

describe("Run a Quuppa experiment", () => {
  beforeEach(async () => {
    await dbDrop()
    this.getData = sinon.stub(getQuuppaData, "getQuuppaData").callsFake(getData)
    this.runQuuppaExperiment = proxyquire(
      "../../src/runExperiment/quuppaExperiment",
      { getQuuppaData: { getQuuppaData: this.getData } }
    )
    this.server = server.listen(3000, () => console.log("server listening on port 3000"))
  })

  afterEach(async () => {
    await dbDrop()
    getQuuppaData.getQuuppaData.restore()
    this.server.close()
  })

  it("should acknowledge a post request at /experiment/run", async () => {
    await initializeDb()
    await insertExperiment("test-experiment")
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodesSimple)
    await NodePosition.bulkCreate(nodePositionsSimple)
    const result = await rest.post("http://localhost:3000/experiments/test-experiment/run", {
      data: { experimentTypes: ["Quuppa"] }
    })
    sinon.assert.calledOnce(this.getData)
    expect(result.response.statusCode).to.equal(201)
    expect(result.data).to.equal("started Quuppa experiment")
  })
})
