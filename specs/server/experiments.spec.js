const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { assign, set } = require("lodash")
const proxyquire = require("proxyquire")
const sinon = require("sinon")
const rest = require("restling")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const { dbSync, dbDrop } = require("../helpers/db")
const { initializeDb } = require("../../src/initializeDb")
const { insertExperiment, insertPoints, insertPositionData } = require("../../src/storeData/index")
const {
  getExperimentByName,
  getExperimentMetricsByName,
  getPositionDataByExperiment
} = require("../../src/getData")
const getQuuppaData = require("../../src/getExperimentalData/getQuuppaData")
const { getData } = require("../mocks/getExperimentalData")
const Node = require("../../src/models/node")
const NodePosition = require("../../src/models/nodePosition")
const nodePositions = require("../testData/nodePositions.json")
const nodes = require("../testData/nodes.json")
const points = require("../testData/points.json")
const positionsWithErrors = require("../testData/positionsWithErrors.json")
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

  it("should return the deleted experiment name on DELETE at /experiments/experiment-name",
    async () => {
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await createExperimentalData("test-experiment1")
      await createExperimentalData("test-experiment2")

      const result = await rest.del("http://localhost:3000/experiments/test-experiment1")

      expect(result.data).to.equal("test-experiment1")
      expect(result.response.statusCode).to.equal(200)
    }
  )

  it(
    "should delete an experiment and all related data on DELETE at /experiments/experiment-name",
    async () => {
      await Zone.bulkCreate(zones)
      await insertPoints(points)
      await Node.bulkCreate(nodes)
      await createExperimentalData("test-experiment")

      await rest.del("http://localhost:3000/experiments/test-experiment")

      const experiment = await getExperimentByName("test-experiment")
      const metrics = await getExperimentMetricsByName("test-experiment")
      const storedNodePositions = await NodePosition.findAll({
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "id"
          ]
        },
        where: { experimentName: "test-experiment" }
      })

      const positionData = await getPositionDataByExperiment("test-experiment")

      expect(experiment).to.be.empty
      expect(metrics).to.be.undefined
      expect(storedNodePositions).to.be.empty
      expect(positionData).to.be.empty
    }
  )

  it("should not delete other experiments on DELETE at /experiments/experiment-name", async () => {
    await Zone.bulkCreate(zones)
    await insertPoints(points)
    await Node.bulkCreate(nodes)
    await createExperimentalData("test-experiment1")
    await createExperimentalData("test-experiment2")

    await rest.del("http://localhost:3000/experiments/test-experiment1")

    const experiment1 = await getExperimentByName("test-experiment1")
    const experiment2 = await getExperimentByName("test-experiment2")
    const metrics1 = await getExperimentMetricsByName("test-experiment1")
    const metrics2 = await getExperimentMetricsByName("test-experiment2")
    const nodePositions1 = await NodePosition.findAll({
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "id"
        ]
      },
      where: { experimentName: "test-experiment1" }
    })
    const nodePositions2 = await NodePosition.findAll({
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "id"
        ]
      },
      where: { experimentName: "test-experiment2" }
    })
    const positionData1 = await getPositionDataByExperiment("test-experiment1")
    const positionData2 = await getPositionDataByExperiment("test-experiment2")

    expect(experiment1).to.be.empty
    expect(experiment2).to.deep.equal({ name: "test-experiment2" })
    expect(metrics1).to.be.undefined
    expect(metrics2.experimentName).to.equal("test-experiment2")
    expect(nodePositions1).to.be.empty
    expect(nodePositions2.map(position => position.experimentName))
      .to.deep.equal(new Array(3).fill("test-experiment2"))
    expect(positionData1).to.be.empty
    expect(positionData2.map(position => position.experimentName))
      .to.deep.equal(new Array(3).fill("test-experiment2"))
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
    await Node.bulkCreate(nodes)
    await NodePosition.bulkCreate(nodePositions)
    const result = await rest.post("http://localhost:3000/experiments/test-experiment/run", {
      data: { experimentTypes: ["Quuppa"] }
    })
    sinon.assert.calledOnce(this.getData)
    expect(result.response.statusCode).to.equal(201)
    expect(result.data).to.equal("started Quuppa experiment")
  })
})

async function createExperimentalData(experimentName) {
  await insertExperiment(experimentName)
  await ExperimentMetrics.create(
    set(assign({}, experimentPrimaryMetrics), "experimentName", experimentName)
  )
  await insertPositionData(
    positionsWithErrors.map(position => set(assign({}, position), "experimentName", experimentName))
  )
  await NodePosition.bulkCreate(
    nodePositions.map(position => set(assign({}, position), "experimentName", experimentName))
  )
}
