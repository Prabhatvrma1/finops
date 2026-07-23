const awsCostExplorer = require('../services/awsCostExplorer');
const { Resource, CostRecord } = require('../models');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Syncs the last 30 days of AWS Cost and Usage data into the local PostgreSQL database.
 */
async function syncCloudData() {
  logger.info('Starting AWS Cloud Data Sync Job...');
  
  try {
    // 1. Calculate Date Range (Last 30 Days)
    const today = new Date();
    const endDateStr = today.toISOString().split('T')[0];
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

    // 2. Fetch from AWS Service
    const results = await awsCostExplorer.getDailyCostAndUsage(startDateStr, endDateStr);
    
    // 3. Process and Save to Database
    let recordsCreated = 0;
    
    for (const result of results) {
      const date = result.TimePeriod.Start;
      
      for (const group of result.Groups) {
        // Group Keys: ["Amazon Elastic Compute Cloud - Compute", "us-east-1"]
        const serviceName = group.Keys[0];
        const region = group.Keys[1];
        const amount = parseFloat(group.Metrics.UnblendedCost.Amount);
        
        if (amount <= 0) {continue;} // Skip zero-cost rows

        // Find or create the corresponding Resource in our DB
        // In a real app, AWS might return resource-level ARNs if enabled.
        // For this demo, we group by Service and treat the service as the "Resource".
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

        // Upsert the CostRecord
        // If we run this script multiple times, we want to update the existing cost for that day,
        // not create a duplicate record.
        const [record, created] = await CostRecord.findOrCreate({
          where: {
            date: date,
            resourceId: resource.id,
            region: region
          },
          defaults: {
            id: uuidv4(),
            cost: amount,
            date: date,
            resourceId: resource.id,
            region: region
          }
        });
        
        if (!created && record.cost !== amount) {
          record.cost = amount;
          await record.save();
        }
        
        if (created) {recordsCreated++;}
      }
    }
    
    logger.info(`✅ AWS Cloud Data Sync Job Completed. Synced ${recordsCreated} new daily records.`);
  } catch (error) {
    logger.error('❌ Failed to sync AWS cloud data:', error);
  }
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
