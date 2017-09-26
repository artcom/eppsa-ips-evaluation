const db = require("./db")


exports.initializeDb = async function initializeDb() {
  await db.sync()
}
