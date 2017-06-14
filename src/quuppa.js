const axios = require("axios")

module.exports = axios.create({
  baseURL: "http://10.1.34.101:8080/qpe",
})
