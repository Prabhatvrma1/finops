process.env.MOCK_DATA = 'true';

const gcpBilling = require('../services/gcpBilling');
const notificationService = require('../services/notificationService');
const cronScheduler = require('../jobs/cronScheduler');
const logger = require('../utils/logger');

// Spy on logger to verify output actions
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('FinOps Service & Automation Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GCP Billing Service', () => {
    it('should generate mock billing data successfully', async () => {
      const data = await gcpBilling.getDailyCostAndUsage('2026-07-01', '2026-07-05');
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('service');
      expect(data[0]).toHaveProperty('cost');
      expect(data[0]).toHaveProperty('region');
    });
  });

  describe('Notification Service', () => {
    it('should execute sendAnomalyAlert successfully (mocked mode)', async () => {
      const anomaly = {
        date: '2026-07-20',
        cost: 250.75,
        severity: 'medium'
      };
      await expect(notificationService.sendAnomalyAlert(anomaly)).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Processing anomaly notification'));
    });
  });

  describe('Cloud Sync & Anomaly Check', () => {
    it('should execute auditAnomalies without throwing', async () => {
      await expect(cronScheduler.auditAnomalies()).resolves.not.toThrow();
    });
  });
});
