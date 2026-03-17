const { Assets, AssetAssignments, Users, sequelize } = require('../models')
const { Op } = require('sequelize')
const { throwCustomError } = require('../utils/response.utils')

const createAssetService = async (req) => {
  const { asset_name, asset_type, serial_number } = req.body
  const { organization_id } = req.user

  const existingAsset = await Assets.findOne({
    where: { serial_number, organization_id },
  })
  if (existingAsset) {
    throwCustomError(
      `Asset with serial number ${serial_number} already exists`,
      400
    )
  }

  const savedAsset = await Assets.create({
    asset_name,
    asset_type,
    organization_id,
    serial_number,
    asset_status: 'available',
  })

  return {
    asset_id: savedAsset.asset_id,
  }
}

const updateAssetService = async (req) => {
  const { asset_name, asset_type, serial_number } = req.body
  const { organization_id } = req.user
  const { id } = req.params

  const asset = await Assets.findByPk(id)
  if (!asset) {
    throwCustomError(`Asset not found`, 404)
  }

  const existingAsset = await Assets.findOne({
    where: { serial_number, organization_id, asset_id: { [Op.ne]: id } },
  })
  if (existingAsset) {
    throwCustomError(
      `Asset with serial number ${serial_number} already exists`,
      400
    )
  }

  const isNotMatchOrg = asset.organization_id != organization_id
  if (isNotMatchOrg) {
    throwCustomError('You dont have access to this resource', 403)
  }

  const isAssetRetired = asset.asset_status === 'retired'
  if (isAssetRetired) {
    throwCustomError(
      `Asset can't be modified. Because asset already retired`,
      400
    )
  }

  asset.asset_name = asset_name
  asset.asset_type = asset_type
  asset.serial_number = serial_number
  const savedAsset = await asset.save()

  return {
    asset_id: savedAsset.asset_id,
    asset_name: savedAsset.asset_name,
    asset_type: savedAsset.asset_type,
    serial_number: savedAsset.serial_number,
  }
}

const retireAssetService = async (req) => {
  const { organization_id } = req.user
  const { id } = req.params

  const asset = await Assets.findByPk(id)
  if (!asset) {
    throwCustomError(`Asset not found`, 404)
  }

  const isNotMatchOrg = asset.organization_id != organization_id
  if (isNotMatchOrg) {
    throwCustomError('You dont have access to this resource', 403)
  }

  const isForbiddenRetire = asset.asset_status !== 'available'
  if (isForbiddenRetire) {
    const customMessage =
      asset.asset_status === 'retired'
        ? 'already retired'
        : 'still used by user'
    throwCustomError(`Asset can't retire. Because asset ${customMessage}`, 400)
  }

  asset.asset_status = 'retired'
  const savedAsset = await asset.save()

  return {
    asset_id: savedAsset.asset_id,
    asset_status: savedAsset.asset_status,
  }
}

const getAssetService = async (req) => {
  const { organization_id } = req.user
  const { limit, page, asset_status, asset_type } = req.query

  const where = { organization_id }

  if (asset_status) where.asset_status = asset_status
  if (asset_type) where.asset_type = asset_type

  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 10
  const offsetNum = (pageNum - 1) * limitNum

  const { count, rows } = await Assets.findAndCountAll({
    where,
    limit: parseInt(limitNum),
    offset: parseInt(offsetNum),
    order: [['created_at', 'DESC']],
  })

  return {
    list: rows,
    pagination: {
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    },
  }
}

const getAssetDetailService = async (req) => {
  const { organization_id } = req.user
  const { id } = req.params

  const asset = await Assets.findByPk(id, {
    include: [
      {
        model: AssetAssignments,
        as: 'assetassignments',
        where: { is_active: 1 },
        required: false,
        attributes: ['assigned_user_id', 'created_at', 'updated_at'],
        include: [
          {
            model: Users,
            as: 'users',
            attributes: ['user_name'],
          },
        ],
      },
    ],
  })
  if (!asset) {
    throwCustomError(`Asset not found`, 404)
  }

  const isNotMatchOrg = asset.organization_id != organization_id
  if (isNotMatchOrg) {
    throwCustomError('You dont have access to this resource', 403)
  }

  return {
    asset_id: asset.asset_id,
    asset_name: asset.asset_name,
    asset_status: asset.asset_status,
    asset_type: asset.asset_type,
    created_at: asset.created_at,
    updated_at: asset.updated_at,
    current_assignment: {
      assigned_user_id: asset?.assetassignments?.[0]?.assigned_user_id || null,
      assigned_user_name:
        asset?.assetassignments?.[0]?.users?.user_name || null,
      created_at: asset?.assetassignments?.[0]?.created_at || null,
      updated_at: asset?.assetassignments?.[0]?.updated_at || null,
    },
  }
}

const assignAssetService = async (req) => {
  const { assigned_user_id } = req.body
  const { organization_id } = req.user
  const { id } = req.params

  const asset = await Assets.findByPk(id)
  if (!asset) {
    throwCustomError(`Asset not found`, 404)
  }

  const user = await Users.findByPk(assigned_user_id)
  if (!user) {
    throwCustomError(`Assigned user not found`, 404)
  }

  const isNotMatchOrg =
    asset.organization_id != organization_id ||
    asset.organization_id !== user.organization_id
  if (isNotMatchOrg) {
    throwCustomError(
      'You or assigned users dont have access to this resource',
      400
    )
  }

  const isAssetRetired = asset.asset_status === 'retired'
  if (isAssetRetired) {
    throwCustomError(
      `Asset can't be modified. Because asset already retired`,
      400
    )
  }

  const transaction = await sequelize.transaction()
  try {
    const existingAssignment = await AssetAssignments.findOne({
      where: { asset_id: id, is_active: 1 },
      lock: transaction.LOCK.UPDATE,
      transaction,
    })
    if (existingAssignment) {
      throwCustomError(
        'Asset already assigned, please unassign the asset first',
        400
      )
    }

    const assignment = await AssetAssignments.create(
      {
        asset_id: id,
        assigned_user_id,
        is_active: 1,
      },
      { transaction }
    )
    await Assets.update(
      { asset_status: 'in-use' },
      { where: { asset_id: id }, transaction }
    )

    await transaction.commit()
    return {
      asset_assignment_id: assignment.asset_assignment_id,
      assigned_user_id: assignment.assigned_user_id,
    }
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

const unassignAssetService = async (req) => {
  const { organization_id } = req.user
  const { id } = req.params

  const asset = await Assets.findByPk(id)
  if (!asset) {
    throwCustomError(`Asset not found`, 404)
  }

  const isNotMatchOrg = asset.organization_id != organization_id
  if (isNotMatchOrg) {
    throwCustomError('You dont have access to this resource', 403)
  }

  const isAssetRetired = asset.asset_status === 'retired'
  if (isAssetRetired) {
    throwCustomError(
      `Asset can't be modified. Because asset already retired`,
      400
    )
  }

  const existingAssignment = await AssetAssignments.findOne({
    where: { asset_id: id, is_active: 1 },
  })

  if (!existingAssignment) {
    throwCustomError(
      `Asset not assigned or not found, can't process further`,
      400
    )
  }

  const transaction = await sequelize.transaction()
  try {
    await AssetAssignments.update(
      { is_active: 0 },
      { where: { asset_id: id, is_active: 1 }, transaction }
    )
    await Assets.update(
      { asset_status: 'available' },
      { where: { asset_id: id }, transaction }
    )

    await transaction.commit()
    return {
      asset_assignment_id: existingAssignment.asset_assignment_id,
      is_active: existingAssignment.is_active,
    }
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

const getAssetAssignmentHistService = async (req) => {
  const { organization_id } = req.user
  const { id } = req.params
  const { limit, page } = req.query

  const asset = await Assets.findByPk(id)
  if (!asset) {
    throwCustomError(`Asset not found`, 404)
  }

  const isNotMatchOrg = asset.organization_id != organization_id
  if (isNotMatchOrg) {
    throwCustomError('You dont have access to this resource', 403)
  }

  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 10
  const offsetNum = (pageNum - 1) * limitNum

  const { count, rows } = await AssetAssignments.findAndCountAll({
    where: { asset_id: id },
    include: [
      {
        model: Users,
        as: 'users',
        attributes: ['user_name'],
      },
    ],
    limit: parseInt(limitNum),
    offset: parseInt(offsetNum),
    order: [['created_at', 'DESC']],
  })

  const rowsFormatted = rows.map((row) => ({
    asset_assignment_id: row.asset_assignment_id,
    assigned_user_id: row.assigned_user_id,
    assigned_user_name: row.users?.user_name,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
  return {
    list: rowsFormatted,
    pagination: {
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    },
  }
}

module.exports = {
  createAssetService,
  updateAssetService,
  retireAssetService,
  getAssetService,
  getAssetDetailService,
  assignAssetService,
  unassignAssetService,
  getAssetAssignmentHistService,
}
