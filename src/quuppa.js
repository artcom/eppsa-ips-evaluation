const axios = require("axios")
const config = require("./constants")

exports.quuppaServer = axios.create({
  baseURL: config.quuppaServer,
})
