const mockGoIndoorData = require("../testData/mockGoIndoorData.json")
const nodes = require("../testData/nodes.json")


exports.getFake = async function getFake(url) {
  if (url === "/") {
    return { data: nodes.map(node => node.id) }
  } else if (url === "/id/node1") {
    return { data: mockGoIndoorData[0] }
  } else if (url === "/id/node2") {
    return { data: mockGoIndoorData[1] }
  } else if (url === "/id/node3") {
    return { data: mockGoIndoorData[2] }
  }
}
