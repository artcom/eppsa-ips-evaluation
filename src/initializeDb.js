const db = require("./db")


exports.initializeDb = async function initializeDb() {
  return await db.sync({ force: true }).then(() => {
  })
}
