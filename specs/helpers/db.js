const db = require("../../src/db")


exports.dbSync = async function dbSync() {
  await db.sync({ force: true })
}

exports.dbDrop = async function dbDrop() {
  await db.drop()
}

exports.tableSync = async function tableSync(table) {
  await table.sync({ force: true })
}

exports.tableDrop = async function tableDrop(table) {
  await table.drop({ force: true })
}
