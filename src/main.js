const { QuuppaExperiment } = require("./runExperiment/quuppaExperiment")
const server = require("./server")

const quuppaExperiment = new QuuppaExperiment("test_quuppa")
quuppaExperiment.run().catch(error => console.error(error))

server.listen(3000, () => console.log("server listening on port 3000"))
