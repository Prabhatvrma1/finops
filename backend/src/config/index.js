// ============================================================================
// Config Loader — Centralizes all configuration in one place
// ============================================================================
//
// LEARNING: Instead of calling process.env.SOMETHING everywhere in your code,
// we load all config HERE and export a single config object. Benefits:
//   1. One place to see ALL config your app needs
//   2. Validation — crash early if required config is missing
//   3. Default values — sensible fallbacks for optional config
//   4. Type coercion — process.env values are ALWAYS strings, we convert here
//
// This follows 12-Factor App Principle #3: Store config in the environment
// ============================================================================

const dotenv = require('dotenv');
const path = require('path');

// Load .env file ONLY in development. In production, env vars come from
// the deployment platform (Kubernetes, Docker, etc.)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

// ============================================================================
// Configuration Object
// ============================================================================
const config = {
  // --- Server ---
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,

  // --- Database ---
  // LEARNING: We use a connection URL format which includes all DB info:
  // postgres://USER:PASSWORD@HOST:PORT/DATABASE
  databaseUrl: process.env.DATABASE_URL || 'postgres://cloudcostiq:localdev123@localhost:5432/cloudcostiq',

  // --- Redis ---
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // --- JWT Authentication ---
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // --- Mock Data Mode ---
  // LEARNING: In development, we don't want to hit real cloud APIs (costs money,
  // requires credentials). Mock mode generates realistic fake data instead.
  useMockData: process.env.MOCK_DATA === 'true',

  // --- Cloud Provider Credentials ---
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  },

  azure: {
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },

  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    keyFile: process.env.GCP_KEY_FILE,
  },

  // --- OpenAI ---
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // --- Logging ---
  logLevel: process.env.LOG_LEVEL || 'info',
};

// ============================================================================
// Validation — Crash early if critical config is missing
// ============================================================================
// LEARNING: It's MUCH better to crash immediately on startup with a clear error
// message ("JWT_SECRET is required") than to crash hours later when a user tries
// to login and the JWT signing fails with a cryptic error.
// ============================================================================
const requiredInProduction = ['JWT_SECRET', 'DATABASE_URL'];

if (config.env === 'production') {
  for (const key of requiredInProduction) {
    if (!process.env[key]) {
      throw new Error(`❌ Missing required environment variable: ${key}`);
    }
  }
}

module.exports = config;
