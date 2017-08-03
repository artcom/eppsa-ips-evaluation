if (process.env.DATABASE
  && process.env.DATABASE_USER
  && process.env.DATABASE_PORT
  && process.env.DATABASE_HOST
  && process.env.DATABASE_PASSWORD
) {
  module.exports = {
    database: {
      database: process.env.DATABASE,
      user: process.env.DATABASE_USER,
      port: process.env.DATABASE_PORT,
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASSWORD
    }
  }
} else {
  module.exports = require("../.config.json")
}
