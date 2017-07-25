const PositionData = require("../models/positionData")


module.exports = async function storePositionData(data) {
  return await PositionData.bulkCreate(data)
}
