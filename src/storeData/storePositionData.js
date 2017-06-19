const PositionData = require("../models/positionData")


module.exports = function storePositionData(data) {
  for (const datum of data) {
    PositionData.create(datum)
  }
}
