'use strict'
module.exports = (sequelize, DataTypes) => {
  const AssetAssignments = sequelize.define(
    'AssetAssignments',
    {
      asset_assignment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assigned_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.TINYINT,
        default: 0,
      },
    },
    {
      tableName: 'asset_assignments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )

  AssetAssignments.associate = (models) => {
    AssetAssignments.belongsTo(models.Assets, {
      foreignKey: 'asset_id',
      sourceKey: 'asset_id',
      as: 'assets',
    })
    AssetAssignments.belongsTo(models.Users, {
      foreignKey: 'assigned_user_id',
      sourceKey: 'user_id',
      as: 'users',
    })
  }

  return AssetAssignments
}
