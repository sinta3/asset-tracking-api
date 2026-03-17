const { Assets, AssetAssignments } = require('../../models')

const createAsset = async (overrides = {}) => {
  return Assets.create({
    asset_name: 'Test Laptop',
    asset_type: 'device',
    asset_status: 'available',
    serial_number: `SN${Date.now()}`, // unique per test
    organization_id: 1,
    ...overrides,
  })
}

const createAssetAssignment = async (overrides = {}) => {
  return AssetAssignments.create({
    asset_id: 1,
    assigned_user_id: 1,
    is_active: 1,
    ...overrides,
  })
}

const getAssetAssignment = async (asset_id) => {
  return AssetAssignments.findAll({
    where: {
      asset_id: asset_id,
    },
  })
}

module.exports = {
  createAsset,
  createAssetAssignment,
  getAssetAssignment,
}
