const PositionData = require("../models/positionData")


module.exports = async function storePositionData(data) {
  await PositionData.bulkCreate(data)
}
