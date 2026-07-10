// ============================================================================
// Logger — Winston Logging Setup
// ============================================================================
//
// LEARNING: console.log() is fine for quick debugging, but production apps need
// a proper logging library because:
//
//   1. LOG LEVELS — Not all messages are equal:
//      - error: Something broke! Fix it NOW.
//      - warn:  Something concerning happened. Investigate soon.
//      - info:  Normal operation events (server started, user logged in).
//      - debug: Detailed info for developers debugging issues.
//
//   2. STRUCTURED LOGGING — Instead of plain text, logs include metadata
//      (timestamps, request IDs) that make them searchable in tools like
//      ELK Stack, CloudWatch, or Grafana Loki.
//
//   3. TRANSPORTS — Send logs to multiple destinations:
//      - Console (for development)
//      - Files (for persistence)
//      - Cloud services (for production monitoring)
//
// ============================================================================

const winston = require('winston');
const config = require('../config');

// ============================================================================
// Custom Log Format
// ============================================================================
// LEARNING: We create a custom format that includes:
//   - timestamp: when the event happened (ISO 8601 format)
//   - level: severity (error/warn/info/debug)
//   - message: what happened
//   - any extra metadata (request ID, user ID, etc.)
// ============================================================================
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Include stack traces for errors
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    // Include metadata if present (e.g., request ID, user info)
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    // Include stack trace if it's an error
    const stackStr = stack ? `\n${stack}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}${stackStr}`;
  })
);

// ============================================================================
// Create Logger Instance
// ============================================================================
const logger = winston.createLogger({
  level: config.logLevel, // Only log messages at this level or higher

  // In production, use JSON format (machine-readable, good for log aggregation)
  // In development, use the custom human-readable format
  format: config.env === 'production'
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : logFormat,

  // LEARNING: "Transports" are destinations where logs are sent
  transports: [
    // Always log to console
    new winston.transports.Console({
      colorize: config.env !== 'production', // Colors in dev, not in prod (JSON)
    }),
  ],

  // LEARNING: "Exit on error = false" means if the logger itself fails,
  // don't crash the app. The logger should never cause downtime.
  exitOnError: false,
});

module.exports = logger;
