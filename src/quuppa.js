const axios = require("axios")

exports.quuppaServer = axios.create({
  baseURL: "http://10.1.34.101:8080/qpe",
})
