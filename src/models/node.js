const Sequelize = require("sequelize")
const db = require("../db")

const Node = db.define("node", {
  id: { type: Sequelize.STRING, allowNull: false, unique: true },
  name: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
  type: { type: Sequelize.STRING }
})

module.exports = Node
