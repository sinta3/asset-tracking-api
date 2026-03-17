const express = require('express')
const router = express.Router()
const {
  createAsset,
  updateAsset,
  retireAsset,
  getAssetDetail,
  getAsset,
  assignAsset,
  unassignAsset,
  getAssetAssignmentHist,
} = require('../controllers/asset.controller')
const {
  createAssetSchema,
  updateAssetSchema,
  assignAssetSchema,
  assetIdParamsSchema,
  getAssetsQuerySchema,
  getAssetsHistQuerySchema,
} = require('../validations/asset.validation')
const {
  validateRequest,
} = require('../middlewares/request-validation.middleware')
const {
  validateTokenUser,
  validateTokenAdmin,
} = require('../middlewares/token-validation.middleware')

router.post(
  '/',
  validateTokenAdmin,
  validateRequest(createAssetSchema),
  createAsset
)
router.put(
  '/:id',
  validateTokenAdmin,
  validateRequest(assetIdParamsSchema, 'params'),
  validateRequest(updateAssetSchema),
  updateAsset
)
router.delete(
  '/:id',
  validateTokenAdmin,
  validateRequest(assetIdParamsSchema, 'params'),
  retireAsset
)
router.post(
  '/:id/assign',
  validateTokenAdmin,
  validateRequest(assetIdParamsSchema, 'params'),
  validateRequest(assignAssetSchema),
  assignAsset
)
router.post(
  '/:id/unassign',
  validateTokenAdmin,
  validateRequest(assetIdParamsSchema, 'params'),
  unassignAsset
)

router.get(
  '',
  validateTokenUser,
  validateRequest(getAssetsQuerySchema, 'query'),
  getAsset
)
router.get(
  '/:id',
  validateTokenUser,
  validateRequest(assetIdParamsSchema, 'params'),
  getAssetDetail
)
router.get(
  '/:id/history',
  validateTokenUser,
  validateRequest(assetIdParamsSchema, 'params'),
  validateRequest(getAssetsHistQuerySchema, 'query'),
  getAssetAssignmentHist
)

module.exports = router
