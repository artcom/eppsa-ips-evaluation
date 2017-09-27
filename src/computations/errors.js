const error2d = function error2d(datum) {
  const { point, estCoordinateX, estCoordinateY } = datum
  return Math.sqrt(
    Math.pow(point.trueCoordinateX - estCoordinateX, 2)
    + Math.pow(point.trueCoordinateY - estCoordinateY, 2)
  )
}

const error3d = function error3d(datum) {
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

const errors = function errors(data) {
  return data.map(datum => ({
    id: datum.id,
    pointName: datum.pointName,
    localizedNodeId: datum.localizedNodeId,
    localizedNodeName: datum.localizedNodeName,
    localizationError2d: error2d(datum),
    localizationError3d: error3d(datum)
  }))
}

exports.error2d = error2d
exports.error3d = error3d
exports.errors = errors
