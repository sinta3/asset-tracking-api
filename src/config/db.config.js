const { sequelize } = require('../models/index')
const logger = require('../utils/logger.utils')

const initDb = async () => {
  await sequelize.authenticate()
  logger.info('DB connected')
  await sequelize.sync({ alter: false })
  logger.info('Database synced')
}

const closeDb = async () => {
  await sequelize.close()
  logger.info('DB disconnected')
}

module.exports = { initDb, closeDb }
