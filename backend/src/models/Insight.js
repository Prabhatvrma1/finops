const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Insight = sequelize.define('Insight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('anomaly', 'recommendation', 'action'),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  savings: {
    type: DataTypes.DECIMAL(10, 2), // Estimated savings per month
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'resolved', 'ignored'),
    defaultValue: 'active',
  },
});

Insight.associate = (models) => {
  Insight.belongsTo(models.Resource, { foreignKey: 'resourceId' });
};

module.exports = Insight;
