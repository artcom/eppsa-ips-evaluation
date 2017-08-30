const { describe, it } = require("mocha")
const { expect } = require("chai")
const expectedPointErrors = require("../testData/pointErrors.json")
const pointMeasurements = require("../testData/pointMeasurements.json")
const {
  zoneAccuracy,
  error2d,
  error3d,
  errors
} = require("../../src/computations/errors")


describe("Error computations", () => {
  describe("Room accuracy computation", () => {
    it("returns the room accuracy for a point", () => {
      const rightPoint = {
        estZoneLabel: "zone3",
        point: {
          trueZoneLabel: "zone3"
        }
      }
      const wrongPoint = {
        estZoneLabel: "zone1",
        point: {
          trueZoneLabel: "zone3"
        }
      }
      const rightZone = zoneAccuracy(rightPoint)
      const wrongZone = zoneAccuracy(wrongPoint)

      expect(rightZone).to.equal(1)
      expect(wrongZone).to.equal(0)
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
          + Math.pow(2 - 3, 2)
        )
      )
    })
  })

  describe("Errors", () => {
    it("returns an object with error calculations", () => {
      const pointErrors = errors(pointMeasurements)

      expect(pointErrors).to.deep.equal(expectedPointErrors)
    })
  })
})
