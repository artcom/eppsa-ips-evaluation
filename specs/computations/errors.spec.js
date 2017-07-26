const { describe, it } = require("mocha")
const { expect } = require("chai")
const {
  roomAccuracy,
  error2d,
  error3d
} = require("../../src/computations/errors")


describe("Error computations", () => {
  describe("Room accuracy computation", () => {
    it("returns the room accuracy for a point", () => {
      const rightPoint = { point: { trueRoomLabel: "Room_1" }, estRoomLabel: "Room_1" }
      const wrongPoint = { point: { trueRoomLabel: "Room_2" }, estRoomLabel: "Room_1" }
      const rightRoom = roomAccuracy(rightPoint)
      const wrongRoom = roomAccuracy(wrongPoint)

      expect(rightRoom).to.equal(1)
      expect(wrongRoom).to.equal(0)
    })
  })

  describe("Localization error in 2D", () => {
    it("returns the 2D localization error of a point", () => {
      const experimentalPoint = {
        point: { trueCoordinateX: 2, trueCoordinateY: 3 },
        estCoordinateX: 2.5,
        estCoordinateY: 2.8
      }
      const pointError2d = error2d(experimentalPoint)

      expect(pointError2d).to.equal(Math.sqrt(Math.pow(2 - 2.5, 2) + Math.pow(3 - 2.8, 2)))
    })
  })

  describe("Localization error in 3D", () => {
    it("returns the 3D localization error of a point", () => {
      const experimentalPoint = {
        point: { trueCoordinateX: 2, trueCoordinateY: 3, trueCoordinateZ: 4 },
        estCoordinateX: 2.5,
        estCoordinateY: 2.8,
        estCoordinateZ: 4.2
      }
      const pointError2d = error3d(experimentalPoint)

      expect(pointError2d).to.equal(
        Math.sqrt(
          Math.pow(2 - 2.5, 2)
          + Math.pow(3 - 2.8, 2)
          + Math.pow(4 - 4.2, 2)
        )
      )
    })
  })
})
