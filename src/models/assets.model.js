'use strict'
module.exports = (sequelize, DataTypes) => {
  const Assets = sequelize.define(
    'Assets',
    {
      asset_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      asset_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      asset_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      serial_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'assets',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['serial_number', 'organization_id'],
        },
      ],
    }
  )

  Assets.associate = (models) => {
    Assets.belongsTo(models.Organizations, {
      foreignKey: 'organization_id',
      sourceKey: 'organization_id',
      as: 'organizations',
    })
    Assets.hasMany(models.AssetAssignments, {
      foreignKey: 'asset_id',
      sourceKey: 'asset_id',
      as: 'assetassignments',
    })
  }

  return Assets
}
