const db = require("../../src/db")


exports.dbSync = async function dbSync() {
  await db.sync({ force: true })
}

exports.dbDrop = async function dbDrop() {
  await db.drop()
}
