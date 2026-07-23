const { CostExplorerClient, GetCostAndUsageCommand } = require("@aws-sdk/client-cost-explorer");
const logger = require('../utils/logger');
const config = require('../config');

// Initialize the AWS Client
// In production, this automatically picks up credentials from the IAM Role attached to the EKS Pod,
// or from environment variables (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY).
const ceClient = new CostExplorerClient({ region: "us-east-1" });

/**
 * Fetches daily cost and usage data from AWS, grouped by Service and Region.
 * @param {string} startDate - Format YYYY-MM-DD
 * @param {string} endDate - Format YYYY-MM-DD
 * @returns {Promise<Array>} Array of daily cost results.
 */
exports.getDailyCostAndUsage = async (startDate, endDate) => {
  if (config.useMockData) {
    logger.info(`[MOCK AWS] Fetching Cost and Usage from ${startDate} to ${endDate}`);
    return generateMockCostAndUsage(startDate, endDate);
  }

  try {
    const params = {
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost'],
      GroupBy: [
        { Type: 'DIMENSION', Key: 'SERVICE' },
        { Type: 'DIMENSION', Key: 'REGION' }
      ]
    };
    
    logger.info(`Fetching AWS CostExplorer data from ${startDate} to ${endDate}`);
    const command = new GetCostAndUsageCommand(params);
    const response = await ceClient.send(command);
    return response.ResultsByTime;
  } catch (error) {
    logger.error('AWS CostExplorer Error (getDailyCostAndUsage):', error);
    throw error;
  }
};

/**
 * Generates mock data matching the AWS SDK response format.
 */
function generateMockCostAndUsage(startDateStr, endDateStr) {
  const results = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  const services = [
    { name: 'Amazon Elastic Compute Cloud - Compute', region: 'us-east-1', costBase: 150 },
    { name: 'Amazon Relational Database Service', region: 'us-west-2', costBase: 80 },
    { name: 'Amazon Simple Storage Service', region: 'us-east-1', costBase: 40 },
    { name: 'AWS Lambda', region: 'eu-central-1', costBase: 15 }
  ];

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const groups = services.map(svc => {
      // Add some random daily variance (-10% to +10%)
      const variance = 1 + ((Math.random() * 0.2) - 0.1);
      const dailyCost = (svc.costBase * variance).toFixed(2);
      
      return {
        Keys: [svc.name, svc.region],
        Metrics: {
          UnblendedCost: { Amount: dailyCost, Unit: 'USD' }
        }
      };
    });

    // The AWS 'TimePeriod.End' for a daily metric is the next day exclusively.
    const dayEnd = new Date(d);
    dayEnd.setDate(dayEnd.getDate() + 1);

    results.push({
      TimePeriod: {
        Start: d.toISOString().split('T')[0],
        End: dayEnd.toISOString().split('T')[0]
      },
      Total: {},
      Groups: groups,
      Estimated: false
    });
  }
  
  return results;
}
