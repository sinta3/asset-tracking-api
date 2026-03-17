const {
  createAssetService,
  updateAssetService,
  retireAssetService,
  getAssetService,
  getAssetDetailService,
  assignAssetService,
  unassignAssetService,
  getAssetAssignmentHistService,
} = require('../services/asset.service')
const { formatResponse } = require('../utils/response.utils')

const createAsset = async (req, res, next) => {
  try {
    const assetData = await createAssetService(req)
    res.status(201).json(formatResponse(assetData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

const updateAsset = async (req, res, next) => {
  try {
    const assetData = await updateAssetService(req)
    res.status(200).json(formatResponse(assetData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

const retireAsset = async (req, res, next) => {
  try {
    const assetData = await retireAssetService(req)
    res.status(200).json(formatResponse(assetData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

const getAsset = async (req, res, next) => {
  try {
    const assetData = await getAssetService(req)
    res.status(200).json(formatResponse(assetData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

const getAssetDetail = async (req, res, next) => {
  try {
    const assetData = await getAssetDetailService(req)
    res.status(200).json(formatResponse(assetData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

const assignAsset = async (req, res, next) => {
  try {
    const assetData = await assignAssetService(req)
    res.status(200).json(formatResponse(assetData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

const unassignAsset = async (req, res, next) => {
  try {
    const assetData = await unassignAssetService(req)
    res.status(200).json(formatResponse(assetData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

const getAssetAssignmentHist = async (req, res, next) => {
  try {
    const assetData = await getAssetAssignmentHistService(req)
    res.status(200).json(formatResponse(assetData, 'Successful request'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createAsset,
  updateAsset,
  retireAsset,
  getAsset,
  getAssetDetail,
  assignAsset,
  unassignAsset,
  getAssetAssignmentHist,
}
