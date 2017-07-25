module.exports = function errors(data) {
  return data.map(datum => ({
    pointId: datum.pointId,
    localizedNodeId: datum.localizedNodeId,
    localizedNodeName: datum.localizedNodeName,
    localizationError2d: pointLocalizationError2d(datum),
    localizationError3d: pointLocalizationError3d(datum),
    roomAccuracy: pointRoomAccuracy(datum)
  }))
}

function pointLocalizationError2d(datum) {
  const { point, estCoordinateX, estCoordinateY } = datum
  return Math.sqrt(
    Math.pow(point.trueCoordinateX - estCoordinateX, 2)
    + Math.pow(point.trueCoordinateY - estCoordinateY, 2)
  )
}

function pointLocalizationError3d(datum) {
  const {
    point,
    estCoordinateX,
    estCoordinateY,
    estCoordinateZ
  } = datum
  return Math.sqrt(
    Math.pow(point.trueCoordinateX - estCoordinateX, 2)
    + Math.pow(point.trueCoordinateY - estCoordinateY, 2)
    + Math.pow(point.trueCoordinateZ - estCoordinateZ, 2)
  )
}

function pointRoomAccuracy(datum) {
  return datum.point.trueRoomLabel === datum.estRoomLabel ? 1 : 0
}
