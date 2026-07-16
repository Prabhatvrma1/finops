const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service: {
    type: DataTypes.STRING, // e.g., 'EC2', 'RDS', 'S3'
    allowNull: false,
  },
  provider: {
    type: DataTypes.ENUM('AWS', 'Azure', 'GCP'),
    allowNull: false,
    defaultValue: 'AWS',
  },
  region: {
    type: DataTypes.STRING, // e.g., 'us-east-1'
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  tags: {
    type: DataTypes.JSONB, // Store resource tags (e.g., env: prod, team: billing)
    defaultValue: {},
  },
});

Resource.associate = (models) => {
  Resource.hasMany(models.CostRecord, { foreignKey: 'resourceId', onDelete: 'CASCADE' });
  Resource.hasMany(models.Insight, { foreignKey: 'resourceId', onDelete: 'SET NULL' });
};

module.exports = Resource;
