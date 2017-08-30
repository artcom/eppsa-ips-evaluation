const data = require("../testData/mockQuuppaData.json")
const mockQuuppaDataSimple = require("../testData/mockQuuppaDataSimple.json")


const getMockData = async function getData() {
  return data
}

const getData = async function getData() {
  return mockQuuppaDataSimple
}

exports.getMockData = getMockData
exports.getData = getData
