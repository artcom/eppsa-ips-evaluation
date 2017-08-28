const { inRange } = require("lodash")


const estimateRoom = function estimateRoom(x, y, z) {
  return inRange(x, 2, 4) && inRange(y, 2, 5) && inRange(z, 1, 3) ? "Room_1" : "Room_1_1"
}

module.exports = estimateRoom
