const { sequelize } = require('../../models')

module.exports = async () => {
  await sequelize.close()
}
