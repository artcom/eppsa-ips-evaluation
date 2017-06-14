const quuppa = require("../quuppa")

module.exports = async function getDataForAllTags() {
  return await quuppa.get("getHAIPLocation", {
    params: {
      version: 2
    }
  })
}
