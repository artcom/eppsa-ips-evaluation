module.exports = function computeLocalizationError2d(data) {
  return data.map(point => ({
    pointId: point.pointId,
    localizedNodeId: point.localizedNodeId,
    localizedNodeName: point.localizedNodeName,
    localizationError2d: pointLocalizationError2d(point),
    localizationError3d: pointLocalizationError3d(point),
    roomAccuracy: pointRoomAccuracy(point)
  }))
}

function pointLocalizationError2d(point) {
  const { trueCoordinateX, trueCoordinateY, estCoordinateX, estCoordinateY } = point
  return Math.sqrt(
    Math.pow(trueCoordinateX - estCoordinateX, 2)
    + Math.pow(trueCoordinateY - estCoordinateY, 2)
  )
}

function pointLocalizationError3d(point) {
  const {
    trueCoordinateX,
    trueCoordinateY,
    trueCoordinateZ,
    estCoordinateX,
    estCoordinateY,
    estCoordinateZ
  } = point
  return Math.sqrt(
    Math.pow(trueCoordinateX - estCoordinateX, 2)
    + Math.pow(trueCoordinateY - estCoordinateY, 2)
    + Math.pow(trueCoordinateZ - estCoordinateZ, 2)
  )
}

function pointRoomAccuracy(point) {
  return point.trueRoomLabel === point.estRoomLabel ? 1 : 0
}
