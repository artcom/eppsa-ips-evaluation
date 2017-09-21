const { meanBy } = require("lodash")
const { goIndoorServer } = require("../../src/goIndoor")


const getAverage = function getAverage(data) {
  return {
    x: meanBy(data, datum => Number(datum.x)).toFixed(2),
    y: meanBy(data, datum => Number(datum.y)).toFixed(2)
  }
}

const getNodeIds = async function getNodeIds() {
  const response = await goIndoorServer.get("/")
  return response.data
}

const getNodeData = async function getNodeData(node) {
  const response = await goIndoorServer.get(`/id/${node}`)
  return response.data
}

const getDataForAllNodes = async function getDataForAllNodes() {
  const nodes = await getNodeIds()
  return await Promise.all(
    nodes.map(async node => ({ node, data: getAverage(await getNodeData(node)) }))
  )
}

exports.getAverage = getAverage
exports.getNodeIds = getNodeIds
exports.getNodeData = getNodeData
exports.getDataForAllNodes = getDataForAllNodes
