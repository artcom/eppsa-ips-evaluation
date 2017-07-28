const { QuuppaExperiment } = require("./runExperiment/quuppaExperiment")

const quuppaExperiment = new QuuppaExperiment("test_quuppa")
quuppaExperiment.run().catch(error => console.error(error))
