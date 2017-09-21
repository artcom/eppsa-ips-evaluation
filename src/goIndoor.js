const axios = require("axios")
const config = require("./constants")

exports.goIndoorServer = axios.create({
  baseURL: config.goIndoorServer,
})
