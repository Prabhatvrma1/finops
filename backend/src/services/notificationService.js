const logger = require('../utils/logger');
const config = require('../config');

// In production, we'd use @slack/web-api and nodemailer
// Here we implement robust toggleable alerting with mock support

/**
 * Sends a cost anomaly alert to the configured channels (Slack, Email).
 * @param {Object} anomaly - Anomaly object containing date, cost, service, etc.
 */
exports.sendAnomalyAlert = async (anomaly) => {
  logger.info(`Processing anomaly notification for date ${anomaly.date}...`);

  const title = `⚠️ FinOps Anomaly Alert - CloudCostIQ`;
  const message = `An anomalous cost spike of $${anomaly.cost} was detected on ${anomaly.date} in your cloud infrastructure.`;

  // 1. Send Slack Alert
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await sendSlackNotification({
        title,
        text: message,
        color: '#FF5733',
        fields: [
          { title: 'Date', value: anomaly.date, short: true },
          { title: 'Detected Cost', value: `$${anomaly.cost}`, short: true },
          { title: 'Severity', value: anomaly.severity || 'Medium', short: true }
        ]
      });
    } catch (error) {
      logger.error('Failed to dispatch Slack notification:', error);
    }
  } else {
    logger.info('[MOCK SLACK] Webhook URL not set. Logging Slack message instead:', message);
  }

  // 2. Send Email Alert
  if (process.env.SMTP_HOST) {
    try {
      await sendEmailNotification({
        to: process.env.ALERT_EMAIL_RECIPIENTS || 'admin@cloudcostiq.local',
        subject: title,
        body: message
      });
    } catch (error) {
      logger.error('Failed to dispatch Email notification:', error);
    }
  } else {
    logger.info(`[MOCK EMAIL] SMTP Host not configured. Logging Email to admin@cloudcostiq.local:`, message);
  }
};

/**
 * Raw Slack webhook dispatcher helper.
 */
async function sendSlackNotification(payload) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const slackBody = {
    attachments: [
      {
        fallback: payload.text,
        color: payload.color,
        title: payload.title,
        text: payload.text,
        fields: payload.fields,
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  if (config.useMockData) {
    logger.info('[MOCK SLACK API] Dispatched webhook attachment:', JSON.stringify(slackBody));
    return;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackBody)
  });

  if (!response.ok) {
    throw new Error(`Slack webhook responded with status ${response.status}`);
  }
}

/**
 * Raw Email sender helper.
 */
async function sendEmailNotification(email) {
  // Production nodemailer configuration placeholder
  logger.info(`[SMTP] Sending email alert to ${email.to} via host ${process.env.SMTP_HOST}...`);
}
