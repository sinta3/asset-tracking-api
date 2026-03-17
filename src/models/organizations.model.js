'use strict'
module.exports = (sequelize, DataTypes) => {
  const Organizations = sequelize.define(
    'Organizations',
    {
      organization_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      organization_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'organizations',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )

  Organizations.associate = (models) => {
    Organizations.hasMany(models.Users, {
      foreignKey: 'organization_id',
      sourceKey: 'organization_id',
      as: 'users',
    })
    Organizations.hasMany(models.Assets, {
      foreignKey: 'organization_id',
      sourceKey: 'organization_id',
      as: 'assets',
    })
  }

  return Organizations
}
