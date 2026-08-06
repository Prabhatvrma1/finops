const awsCostExplorer = require('../services/awsCostExplorer');
const gcpBilling = require('../services/gcpBilling');
const { Resource, CostRecord } = require('../models');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Syncs the last 30 days of AWS and GCP Cost and Usage data into the database.
 */
async function syncCloudData() {
  logger.info('Starting Cloud Data Sync Job (AWS & GCP)...');
  
  // Calculate Date Range (Last 30 Days)
  const today = new Date();
  const endDateStr = today.toISOString().split('T')[0];
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

  let awsRecordsCreated = 0;
  let gcpRecordsCreated = 0;

  // 1. Sync AWS Costs
  try {
    const awsResults = await awsCostExplorer.getDailyCostAndUsage(startDateStr, endDateStr);
    
    for (const result of awsResults) {
      const date = result.TimePeriod.Start;
      for (const group of result.Groups) {
        const serviceName = group.Keys[0];
        const region = group.Keys[1];
        const amount = parseFloat(group.Metrics.UnblendedCost.Amount);
        
        if (amount <= 0) { continue; }

        const [resource] = await Resource.findOrCreate({
          where: { name: serviceName, region: region },
          defaults: {
            id: uuidv4(),
            name: serviceName,
            service: serviceName,
            region: region,
            status: 'running'
          }
        });

        const [record, created] = await CostRecord.findOrCreate({
          where: { date, resourceId: resource.id, region },
          defaults: {
            id: uuidv4(),
            cost: amount,
            date,
            resourceId: resource.id,
            region
          }
        });
        
        if (!created && record.cost !== amount) {
          record.cost = amount;
          await record.save();
        }
        if (created) { awsRecordsCreated++; }
      }
    }
    logger.info(`✅ AWS Sync Completed. Synced ${awsRecordsCreated} records.`);
  } catch (error) {
    logger.error('❌ Failed to sync AWS cloud data:', error);
  }

  // 2. Sync GCP Costs
  try {
    const gcpResults = await gcpBilling.getDailyCostAndUsage(startDateStr, endDateStr);
    
    for (const item of gcpResults) {
      const { date, service, region, cost } = item;
      
      if (cost <= 0) { continue; }

      const [resource] = await Resource.findOrCreate({
        where: { name: `${service} (GCP)`, region: region },
        defaults: {
          id: uuidv4(),
          name: `${service} (GCP)`,
          service: service,
          region: region,
          status: 'running'
        }
      });

      const [record, created] = await CostRecord.findOrCreate({
        where: { date, resourceId: resource.id, region },
        defaults: {
          id: uuidv4(),
          cost: cost,
          date,
          resourceId: resource.id,
          region
        }
      });

      if (!created && record.cost !== cost) {
        record.cost = cost;
        await record.save();
      }
      if (created) { gcpRecordsCreated++; }
    }
    logger.info(`✅ GCP Sync Completed. Synced ${gcpRecordsCreated} records.`);
  } catch (error) {
    logger.error('❌ Failed to sync GCP cloud data:', error);
  }

  logger.info(`✅ Cloud Data Sync completed. AWS: ${awsRecordsCreated}, GCP: ${gcpRecordsCreated}`);
}

// Allow running directly from command line for testing
if (require.main === module) {
  require('../config/database').testConnection().then(() => {
    return syncCloudData();
  }).then(() => {
    process.exit(0);
  });
}

module.exports = syncCloudData;
