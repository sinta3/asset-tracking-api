require('dotenv').config({ path: '.env.test' })
const { sequelize } = require('../../models')

beforeEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

  await sequelize.query('TRUNCATE TABLE asset_assignments')
  await sequelize.query('TRUNCATE TABLE assets')
  await sequelize.query('TRUNCATE TABLE users')
  await sequelize.query('TRUNCATE TABLE organizations')

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
})
