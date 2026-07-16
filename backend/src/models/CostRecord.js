const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CostRecord = sequelize.define('CostRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Foreign Key to Resource model will be added via association
});

CostRecord.associate = (models) => {
  CostRecord.belongsTo(models.Resource, { foreignKey: 'resourceId' });
};

module.exports = CostRecord;
