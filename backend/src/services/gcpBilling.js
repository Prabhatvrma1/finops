const logger = require('../utils/logger');
const config = require('../config');

// In production, GCP credentials would be initialized via @google-cloud/billing
// and @google-cloud/bigquery since GCP billing exports to BigQuery.
// We use a clean toggleable mock strategy for testing.

/**
 * Fetches daily GCP cost and usage data grouped by Service and Region.
 * @param {string} startDate - Format YYYY-MM-DD
 * @param {string} endDate - Format YYYY-MM-DD
 * @returns {Promise<Array>} Array of daily cost results.
 */
exports.getDailyCostAndUsage = async (startDate, endDate) => {
  if (config.useMockData) {
    logger.info(`[MOCK GCP] Fetching GCP Billing data from ${startDate} to ${endDate}`);
    return generateMockGcpBillingData(startDate, endDate);
  }

  // Production code using BigQuery to query billing exports
  try {
    logger.info(`Querying GCP BigQuery Billing dataset from ${startDate} to ${endDate}`);
    // Example BigQuery Client usage:
    // const { BigQuery } = require('@google-cloud/bigquery');
    // const bigquery = new BigQuery();
    // const query = `SELECT usage_start_time, service.description, location.region, SUM(cost) as cost...`;
    // const [rows] = await bigquery.query(options);
    // return rows;
    return [];
  } catch (error) {
    logger.error('GCP Billing Error (getDailyCostAndUsage):', error);
    throw error;
  }
};

/**
 * Generates mock data matching the GCP BigQuery billing query response format.
 */
function generateMockGcpBillingData(startDateStr, endDateStr) {
  const results = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const services = [
    { name: 'Compute Engine', region: 'us-central1', costBase: 120 },
    { name: 'Cloud SQL', region: 'us-east4', costBase: 65 },
    { name: 'Google Kubernetes Engine', region: 'us-central1', costBase: 90 },
    { name: 'Cloud Storage', region: 'europe-west1', costBase: 25 }
  ];

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];

    services.forEach(svc => {
      const variance = 1 + ((Math.random() * 0.18) - 0.09);
      const dailyCost = parseFloat((svc.costBase * variance).toFixed(2));

      results.push({
        date: dateStr,
        service: svc.name,
        region: svc.region,
        cost: dailyCost
      });
    });
  }

  return results;
}
