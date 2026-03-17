const Joi = require('joi')

const paginationSchema = {
  page: Joi.number().integer().positive(),
  limit: Joi.number().integer().positive(),
}

module.exports = {
  paginationSchema,
}
