const { sequelize } = require('../config/database');
const User = require('./User');
const Resource = require('./Resource');
const CostRecord = require('./CostRecord');
const Insight = require('./Insight');

const models = {
  User,
  Resource,
  CostRecord,
  Insight,
};

// Setup associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
