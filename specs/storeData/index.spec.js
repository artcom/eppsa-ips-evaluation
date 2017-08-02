const { describe, it, beforeEach, afterEach } = require("mocha")
const { expect } = require("chai")
const { assign, keys, pick } = require("lodash")
const { checkPrimaryMetrics } = require("../helpers/data")
const { dbSync, dbDrop } = require("../helpers/db")
const Experiment = require("../../src/models/experiment")
const ExperimentMetrics = require("../../src/models/experimentMetrics")
const experimentPrimaryMetrics = require("../testData/experimentPrimaryMetrics.json")
const {
  insertExperiment,
  insertPrimaryMetrics,
  upsertPrimaryMetrics,
  upsertNodePosition,
  upsertNodePositions
} = require("../../src/storeData")
const NodePosition = require("../../src/models/nodePosition")


describe("Process experimental data", () => {
  beforeEach(async () => {
    await dbSync()
  })

  afterEach(async () => {
    await dbDrop()
  })

  describe("insertPrimaryMetrics", () => {
    it("stores experiment metrics", async () => {
      await Experiment.create({ name: "test-experiment" })
      await insertPrimaryMetrics(experimentPrimaryMetrics)
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      checkPrimaryMetrics({ experimentMetrics })
    })
  })

  describe("upsertPrimaryMetrics", () => {
    it("inserts a primaryMetrics when experiment name is not present", async () => {
      await insertExperiment("test-experiment")
      const initialMetrics = assign({}, experimentPrimaryMetrics)
      assign(initialMetrics, { error2dAverage: 0.8 })
      await insertPrimaryMetrics(initialMetrics)
      await upsertPrimaryMetrics(experimentPrimaryMetrics)
      const experimentMetrics = await ExperimentMetrics.findAll({
        where: { experimentName: "test-experiment" },
        include: { model: Experiment }
      })
      expect(experimentMetrics.length).to.equal(1)
      checkPrimaryMetrics({ experimentMetrics })
    })

    it("updates a node position when same node ID and experiment name is present", async () => {
      await insertExperiment("test-experiment")
      const initialPosition = {
        localizedNodeId: "1234",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeId: "1234",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeId: "1234",
          experimentName: "test-experiment"
        }
      })
      expect(insertedNodes.length).to.equal(1)
      expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
    })
  })

  describe("upsertNodePosition", () => {
    it("inserts a node position when same node ID and experiment name is not present", async () => {
      await insertExperiment("test-experiment")
      const initialPosition = {
        localizedNodeId: "12",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeId: "1234",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeId: "1234",
          experimentName: "test-experiment"
        }
      })
      expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
    })

    it("updates a node position when same node ID and experiment name is present", async () => {
      await insertExperiment("test-experiment")
      const initialPosition = {
        localizedNodeId: "1234",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPosition = {
        localizedNodeId: "1234",
        pointName: "point1",
        experimentName: "test-experiment"
      }
      await NodePosition.create(initialPosition)
      await upsertNodePosition(upsertedPosition)
      const insertedNodes = await NodePosition.findAll({
        where: {
          localizedNodeId: "1234",
          experimentName: "test-experiment"
        }
      })
      expect(insertedNodes.length).to.equal(1)
      expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
    })
  })

  describe("upsertNodePositions", () => {
    it("should insert node positions when not present", async () => {
      await insertExperiment("test-experiment")
      const initialPosition = {
        localizedNodeId: "12",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPositions = [
        {
          localizedNodeId: "1234",
          pointName: "point1",
          experimentName: "test-experiment"
        },
        {
          localizedNodeId: "5678",
          pointName: "point2",
          experimentName: "test-experiment"
        }
      ]
      await NodePosition.create(initialPosition)
      await upsertNodePositions(upsertedPositions)
      for (const upsertedPosition of upsertedPositions) {
        const insertedNodes = await NodePosition.findAll({
          where: {
            localizedNodeId: upsertedPosition.localizedNodeId,
            experimentName: upsertedPosition.experimentName
          }
        })
        expect(insertedNodes.length).to.equal(1)
        expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
      }
    })

    it("should update present node positions and insert absent node positions", async () => {
      await insertExperiment("test-experiment")
      const initialPosition = {
        localizedNodeId: "1234",
        pointName: "point0",
        experimentName: "test-experiment"
      }
      const upsertedPositions = [
        {
          localizedNodeId: "1234",
          pointName: "point1",
          experimentName: "test-experiment"
        },
        {
          localizedNodeId: "5678",
          pointName: "point2",
          experimentName: "test-experiment"
        }
      ]
      await NodePosition.create(initialPosition)
      await upsertNodePositions(upsertedPositions)
      for (const upsertedPosition of upsertedPositions) {
        const insertedNodes = await NodePosition.findAll({
          where: {
            localizedNodeId: upsertedPosition.localizedNodeId,
            experimentName: upsertedPosition.experimentName
          }
        })
        expect(insertedNodes.length).to.equal(1)
        expect(pick(insertedNodes[0], keys(upsertedPosition))).to.deep.equal(upsertedPosition)
      }
    })
  })
})
