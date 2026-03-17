const Joi = require('joi')
const { paginationSchema } = require('./common.validation')

const createAssetSchema = Joi.object({
  asset_name: Joi.string().min(1).max(255).required(),
  asset_type: Joi.string().valid('equipment', 'tools', 'device').required(),
  serial_number: Joi.string().alphanum().min(1).max(255).required(),
})

const updateAssetSchema = Joi.object({
  asset_name: Joi.string().min(1).max(255).required(),
  asset_type: Joi.string().valid('equipment', 'tools', 'device').required(),
  serial_number: Joi.string().alphanum().min(1).max(255).required(),
})

const assetIdParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

const assignAssetSchema = Joi.object({
  assigned_user_id: Joi.number().integer().positive().required(),
})

const getAssetsQuerySchema = Joi.object({
  ...paginationSchema,
  asset_status: Joi.string().valid('available', 'in-use', 'retired'),
  asset_type: Joi.string().valid('equipment', 'tools', 'device'),
})

const getAssetsHistQuerySchema = Joi.object({
  ...paginationSchema,
})

module.exports = {
  createAssetSchema,
  updateAssetSchema,
  assetIdParamsSchema,
  assignAssetSchema,
  getAssetsQuerySchema,
  getAssetsHistQuerySchema,
}
