const { describe, it } = require("mocha")
const { expect } = require("chai")
const pointMeasurements = require("../testData/pointMeasurements.json")
const {
  roomAccuracy,
  error2d,
  error3d,
  errors
} = require("../../src/computations/errors")


describe("Error computations", () => {
  describe("Room accuracy computation", () => {
    it("returns the room accuracy for a point", () => {
      const rightRoom = roomAccuracy(pointMeasurements[1])
      const wrongRoom = roomAccuracy(pointMeasurements[0])

      expect(rightRoom).to.equal(1)
      expect(wrongRoom).to.equal(0)
    })
  })

  describe("Localization error in 2D", () => {
    it("returns the 2D localization error of a point", () => {
      const experimentalPoint = pointMeasurements[0]
      const pointError2d = error2d(experimentalPoint)

      expect(pointError2d).to.equal(Math.sqrt(Math.pow(1 - 1.1, 2) + Math.pow(1 - 1.01, 2)))
    })
  })

  describe("Localization error in 3D", () => {
    it("returns the 3D localization error of a point", () => {
      const experimentalPoint = pointMeasurements[0]
      const pointError2d = error3d(experimentalPoint)

      expect(pointError2d).to.equal(
        Math.sqrt(
          Math.pow(1 - 1.1, 2)
          + Math.pow(1 - 1.01, 2)
          + Math.pow(2 - 1.9, 2)
        )
      )
    })
  })

  describe("Errors", () => {
    it("Returns an object with error calculations", () => {
      const pointErrors = errors(pointMeasurements)
      const expectedPointErrors = [
        {
          pointId: 1,
          localizedNodeId: "20914830f65a",
          localizedNodeName: "Node1",
          localizationError2d: Math.sqrt(Math.pow(1 - 1.1, 2) + Math.pow(1 - 1.01, 2)),
          localizationError3d: Math.sqrt(
            Math.pow(1 - 1.1, 2)
            + Math.pow(1 - 1.01, 2)
            + Math.pow(2 - 1.9, 2)
          ),
          roomAccuracy: 0
        },
        {
          pointId: 2,
          localizedNodeId: "20914830ce00",
          localizedNodeName: "Node2",
          localizationError2d: Math.sqrt(Math.pow(2 - 2.1, 2) + Math.pow(2 - 2.2, 2)),
          localizationError3d: Math.sqrt(
            Math.pow(2 - 2.1, 2)
            + Math.pow(2 - 2.2, 2)
            + Math.pow(3 - 2.9, 2)
          ),
          roomAccuracy: 1
        },
        {
          pointId: 3,
          localizedNodeId: "6655443322dd",
          localizedNodeName: "Node3",
          localizationError2d: Math.sqrt(Math.pow(3 - 3.3, 2) + Math.pow(4 - 4.2, 2)),
          localizationError3d: Math.sqrt(
            Math.pow(3 - 3.3, 2)
            + Math.pow(4 - 4.2, 2)
            + Math.pow(2 - 1.9, 2)
          ),
          roomAccuracy: 1
        }]

      expect(pointErrors).to.deep.equal(expectedPointErrors)
    })
  })
})
