require('dotenv').config()

module.exports = {
  PORT: process.env.PORT,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_PORT: process.env.DB_PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRED_TIME: process.env.JWT_ACCESS_TOKEN_EXPIRED_TIME,
}
