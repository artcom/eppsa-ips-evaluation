const { includes, keys, pick } = require("lodash")


const positionDataNoErrors = function positionDataNoErrors(positionData) {
  const errorKeys = ["localizationError2d", "localizationError3d", "roomAccuracy"]

  return positionData
    .map(position =>
      pick(position, keys(positionData[0]).filter(key => !includes(errorKeys, key)))
    )
}

exports.positionDataNoErrors = positionDataNoErrors
