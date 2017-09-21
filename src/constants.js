if (process.env.DATABASE
  && process.env.DATABASE_USER
  && process.env.DATABASE_PORT
  && process.env.DATABASE_HOST
  && process.env.DATABASE_PASSWORD
  && process.env.QUUPPA_SERVER
  && process.env.GOINDOOR_SERVER
) {
  module.exports = {
    database: {
      database: process.env.DATABASE,
      user: process.env.DATABASE_USER,
      port: process.env.DATABASE_PORT,
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASSWORD
    },
    quuppaServer: process.env.QUUPPA_SERVER,
    goIndoorServer: process.env.GOINDOOR_SERVER
  }
} else {
  module.exports = require("../.config.json")
}
