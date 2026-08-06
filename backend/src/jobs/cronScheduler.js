const cron = require('node-cron');
const syncCloudData = require('./syncCloudData');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');
const config = require('../config');

// Python ML API URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://python-analytics:8000';

/**
 * Audit and fetch anomalies from Python ML microservice, then alert if any are found.
 */
async function auditAnomalies() {
  logger.info('Auditing cloud anomalies via ML service...');
  try {
    const url = `${PYTHON_API_URL}/api/ml/anomalies`;
    
    // Fetch anomalies from FastAPI FastAPI ML microservice
    let anomalies = [];
    if (config.useMockData) {
      // Direct mock response matching python fastapi service
      anomalies = [
        { date: new Date().toISOString().split('T')[0], cost: 4200.50, severity: 'high' }
      ];
    } else {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        anomalies = json.data || [];
      }
    }

    if (anomalies.length > 0) {
      logger.warn(`Detected ${anomalies.length} cloud cost anomalies! Triggering alerts...`);
      for (const anomaly of anomalies) {
        await notificationService.sendAnomalyAlert(anomaly);
      }
    } else {
      logger.info('No cloud cost anomalies detected today.');
    }
  } catch (error) {
    logger.error('Failed to execute cloud anomaly audit:', error);
  }
}

/**
 * Initializes all cron schedulers for FinOps automation.
 */
function initScheduler() {
  logger.info('Initializing FinOps Cron Schedulers...');

  // 1. Daily Cost Data Sync Job (Every day at midnight)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Cron Triggered: Daily Cloud Data Sync & Audit');
    try {
      await syncCloudData();
      await auditAnomalies();
    } catch (error) {
      logger.error('Error during scheduled daily cloud data sync:', error);
    }
  });

  // 2. Health & Metrics Log Job (Every 6 hours)
  cron.schedule('0 */6 * * *', () => {
    logger.info('Cron Triggered: Health & Metrics check.');
  });
}

// Allow manual trigger
if (require.main === module) {
  logger.info('Manually running anomaly audit...');
  auditAnomalies().then(() => process.exit(0));
}

module.exports = { initScheduler, auditAnomalies };
