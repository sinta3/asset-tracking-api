'use strict'
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    'Users',
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      user_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )

  Users.associate = (models) => {
    Users.belongsTo(models.Organizations, {
      foreignKey: 'organization_id',
      sourceKey: 'organization_id',
      as: 'organizations',
    })
    Users.hasMany(models.AssetAssignments, {
      foreignKey: 'assigned_user_id',
      sourceKey: 'user_id',
      as: 'assetassignments',
    })
  }

  return Users
}
