const axios = require("axios")

exports.quuppaServer = axios.create({
  baseURL: "http://10.1.34.104:8080/qpe",
})
