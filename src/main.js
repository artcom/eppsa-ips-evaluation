// const { QuuppaExperiment } = require("./runExperiment/quuppaExperiment")
const server = require("./server")
const { initializeDb } = require("./initializeDb")

// const quuppaExperiment = new QuuppaExperiment("test_quuppa")
// quuppaExperiment.run().catch(error => console.error(error))

initializeDb().then(() => {
  server.listen(3000, () => console.log("server listening on port 3000"))
})
