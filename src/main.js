const server = require("./server")
const { initializeDb } = require("./initializeDb")


async function runServer() {
  await initializeDb()
  server.listen(3000, () => console.log("server listening on port 3000"))
}

runServer()
