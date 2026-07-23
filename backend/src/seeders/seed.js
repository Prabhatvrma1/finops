const { sequelize, User, Resource, CostRecord, Insight } = require('../models');
const logger = require('../utils/logger');
require('dotenv').config();

const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    
    logger.info('Syncing database (force: true)...');
    await sequelize.sync({ force: true });
    
    logger.info('Creating admin user...');
    await User.create({
      email: 'admin@cloudcostiq.com',
      password: 'password123',
      role: 'admin'
    });

    logger.info('Creating resources...');
    const resourcesData = [
      { name: 'db-prod-cluster-01', service: 'RDS', provider: 'AWS', region: 'us-east-1', tags: { env: 'prod' } },
      { name: 'eks-prod-nodes', service: 'EC2', provider: 'AWS', region: 'us-east-1', tags: { env: 'prod' } },
      { name: 's3-data-lake-raw', service: 'S3', provider: 'AWS', region: 'eu-west-1', tags: { team: 'data' } },
      { name: 'redis-cache-main', service: 'ElastiCache', provider: 'AWS', region: 'us-east-1', tags: { env: 'prod' } },
      { name: 'lambda-api-handlers', service: 'Lambda', provider: 'AWS', region: 'us-east-1', tags: { env: 'dev' } },
      { name: 'aks-cluster-main', service: 'AKS', provider: 'Azure', region: 'eastus', tags: { env: 'prod' } },
      { name: 'cloud-sql-analytics', service: 'Cloud SQL', provider: 'GCP', region: 'us-central1', tags: { team: 'analytics' } }
    ];
    const resources = await Resource.bulkCreate(resourcesData, { returning: true });

    logger.info('Generating cost records (30 days)...');
    const recordsToCreate = [];
    for (let i = 0; i <= 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setUTCHours(0,0,0,0);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayOfWeek = d.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.65 : 1;

      for (const res of resources) {
        // Base cost ranges depending on service
        let baseCost = 0;
        if (res.service === 'RDS') {baseCost = rand(300, 500);}
        else if (res.service === 'EC2' || res.service === 'AKS') {baseCost = rand(200, 400);}
        else if (res.service === 'S3') {baseCost = rand(100, 150);}
        else {baseCost = rand(50, 100);}

        recordsToCreate.push({
          date: dateStr,
          cost: baseCost * weekendFactor,
          region: res.region,
          resourceId: res.id
        });
      }
    }
    await CostRecord.bulkCreate(recordsToCreate);

    logger.info('Generating AI insights...');
    await Insight.bulkCreate([
      {
        type: 'anomaly',
        severity: 'high',
        message: 'EKS Cluster `us-east-prod-1` experienced a 45% spend spike over the last 12 hours.',
        resourceId: resources.find(r => r.service === 'EC2').id
      },
      {
        type: 'recommendation',
        severity: 'medium',
        message: 'Switch 5 RDS instances to Reserved pricing. Estimated savings: $1,250/mo.',
        savings: 1250,
        resourceId: resources.find(r => r.service === 'RDS').id
      },
      {
        type: 'action',
        severity: 'low',
        message: 'Generating optimization script for untagged resources...',
        savings: 0
      }
    ]);

    logger.info('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
