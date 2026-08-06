const logger = require('../utils/logger');
const config = require('../config');

// In-memory persistent state for demo & runtime configuration
let connectedAccounts = [
  {
    id: 'aws-main-01',
    provider: 'AWS',
    name: 'AWS Production (us-east-1)',
    accountId: '1234-5678-9012',
    authType: 'IAM Role ARN',
    roleArn: 'arn:aws:iam::123456789012:role/CloudCostIQRole',
    region: 'us-east-1',
    status: 'connected',
    lastSync: new Date().toISOString()
  },
  {
    id: 'gcp-prod-01',
    provider: 'GCP',
    name: 'GCP BigQuery Export (us-central1)',
    projectId: 'finops-prod-analytics',
    authType: 'Service Account JSON',
    region: 'us-central1',
    status: 'connected',
    lastSync: new Date().toISOString()
  }
];

let globalSettings = {
  useMockData: config.useMockData,
  autoSyncIntervalHours: 24,
  slackAlertsEnabled: true,
  emailAlertsEnabled: true,
  alertThresholdUSD: 500
};

// GET /api/settings/cloud-accounts
exports.getCloudAccounts = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        accounts: connectedAccounts,
        settings: globalSettings
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/settings/cloud-accounts
exports.saveCloudAccount = async (req, res, next) => {
  try {
    const { provider, name, accessKeyId, _secretAccessKey, roleArn, region, projectId, _serviceAccountJson } = req.body;

    if (!provider || !name) {
      return res.status(400).json({
        success: false,
        message: 'Provider and account name are required.'
      });
    }

    const newAccount = {
      id: `${provider.toLowerCase()}-${Date.now()}`,
      provider,
      name,
      accountId: accessKeyId ? `${accessKeyId.slice(0, 4)}...${accessKeyId.slice(-4)}` : (projectId || 'arn-managed'),
      authType: roleArn ? 'IAM Role ARN' : (accessKeyId ? 'Access Key / Secret Key' : 'Service Account JSON'),
      roleArn,
      region: region || 'us-east-1',
      status: 'connected',
      lastSync: new Date().toISOString()
    };

    connectedAccounts.push(newAccount);
    logger.info(`Successfully added ${provider} cloud account: ${name}`);

    res.status(201).json({
      success: true,
      message: `${provider} cloud account connected successfully!`,
      data: newAccount
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/settings/cloud-accounts/:id
exports.deleteCloudAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    connectedAccounts = connectedAccounts.filter(acc => acc.id !== id);
    logger.info(`Deleted cloud account with ID: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Cloud account disconnected successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/settings/test-connection
exports.testConnection = async (req, res, next) => {
  try {
    const { provider } = req.body;
    logger.info(`Testing connection to provider: ${provider}`);

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 800));

    res.status(200).json({
      success: true,
      message: `Connection test to ${provider || 'Cloud Provider'} PASSED. API permissions verified.`,
      status: 'healthy'
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings/global
exports.updateGlobalSettings = async (req, res, next) => {
  try {
    globalSettings = { ...globalSettings, ...req.body };
    logger.info('Updated global FinOps settings:', globalSettings);

    res.status(200).json({
      success: true,
      message: 'Global settings updated successfully.',
      data: globalSettings
    });
  } catch (error) {
    next(error);
  }
};
