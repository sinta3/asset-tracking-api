const {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} = require('./environment.config')

const baseConfig = {
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
}

module.exports = {
  development: baseConfig,
  test: baseConfig,
}
