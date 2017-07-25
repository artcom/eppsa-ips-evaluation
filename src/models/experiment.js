const Sequelize = require("sequelize")
const db = require("../db")


const Experiment = db.define("experiment", {
  name: { type: Sequelize.STRING, allowNull: false, primaryKey: true }
})

module.exports = Experiment
