const Sequelize = require("sequelize")
const db = require("../db")


const ExperimentMetrics = db.define("experiment_metrics", {
  experimentId: { type: Sequelize.STRING, allowNull: false },
  error2dAverage: { type: Sequelize.FLOAT, allowNull: false },
  error2dMin: { type: Sequelize.FLOAT, allowNull: false },
  error2dMax: { type: Sequelize.FLOAT, allowNull: false },
  error2dVariance: { type: Sequelize.FLOAT, allowNull: false },
  error2dMedian: { type: Sequelize.FLOAT, allowNull: false },
  error2dRMS: { type: Sequelize.FLOAT, allowNull: false },
  error2dPercentile75: { type: Sequelize.FLOAT, allowNull: false },
  error2dPercentile90: { type: Sequelize.FLOAT, allowNull: false },
  error3dAverage: { type: Sequelize.FLOAT, allowNull: false },
  error3dMin: { type: Sequelize.FLOAT, allowNull: false },
  error3dMax: { type: Sequelize.FLOAT, allowNull: false },
  error3dVariance: { type: Sequelize.FLOAT, allowNull: false },
  error3dMedian: { type: Sequelize.FLOAT, allowNull: false },
  error3dRMS: { type: Sequelize.FLOAT, allowNull: false },
  error3dPercentile75: { type: Sequelize.FLOAT, allowNull: false },
  error3dPercentile90: { type: Sequelize.FLOAT, allowNull: false },
  roomAccuracyAverage: { type: Sequelize.FLOAT, allowNull: false },
  latencyAverage: { type: Sequelize.FLOAT },
  latencyMin: { type: Sequelize.FLOAT },
  latencyMax: { type: Sequelize.FLOAT },
  latencyVariance: { type: Sequelize.FLOAT },
  latencyMedian: { type: Sequelize.FLOAT },
  latencyRMS: { type: Sequelize.FLOAT },
  latencyPercentile75: { type: Sequelize.FLOAT },
  latencyPercentile90: { type: Sequelize.FLOAT },
  powerConsumptionAverage: { type: Sequelize.FLOAT },
  powerConsumptionMin: { type: Sequelize.FLOAT },
  powerConsumptionMax: { type: Sequelize.FLOAT },
  powerConsumptionVariance: { type: Sequelize.FLOAT },
  powerConsumptionMedian: { type: Sequelize.FLOAT },
  powerConsumptionRMS: { type: Sequelize.FLOAT },
  powerConsumptionPercentile75: { type: Sequelize.FLOAT },
  powerConsumptionPercentile90: { type: Sequelize.FLOAT }
})

module.exports = ExperimentMetrics
