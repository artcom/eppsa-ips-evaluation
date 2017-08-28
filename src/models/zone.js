const Sequelize = require("sequelize")
const db = require("../db")

const Zone = db.define("zone", {
  name: { type: Sequelize.STRING, allowNull: false },
  xMin: { type: Sequelize.FLOAT, allowNull: false },
  xMax: { type: Sequelize.FLOAT, allowNull: false },
  yMin: { type: Sequelize.FLOAT, allowNull: false },
  yMax: { type: Sequelize.FLOAT, allowNull: false },
  zMin: { type: Sequelize.FLOAT },
  zMax: { type: Sequelize.FLOAT }
})

module.exports = Zone
