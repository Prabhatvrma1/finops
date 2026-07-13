// ============================================================================
// Dashboard API Routes
// ============================================================================
//
// LEARNING: Express Router lets you group related routes together.
// Instead of cluttering server.js with dozens of app.get() calls,
// we organize routes by feature area (dashboard, infrastructure, auth, etc.)
//
// Each route:
//   1. Receives a request from the frontend
//   2. Generates or fetches the data
//   3. Returns JSON response
//
// All endpoints here are prefixed with /api/dashboard (set in server.js)
// ============================================================================

const express = require('express');
const router = express.Router();
const {
  generateKPIs,
  generateCostTrend,
  generateTopConsumers,
  generateRegions,
  generateInsights,
} = require('../utils/mockData');
const logger = require('../utils/logger');

// ============================================================================
// GET /api/dashboard/kpis
// ============================================================================
// Returns KPI card data: today's spend, 7-day trailing, MTD, AI forecast
// ============================================================================
router.get('/kpis', (req, res) => {
  try {
    const kpis = generateKPIs();
    logger.debug('Generated KPI data');
    res.json({ success: true, data: kpis });
  } catch (error) {
    logger.error('Failed to generate KPIs:', error);
    res.status(500).json({ success: false, error: 'Failed to load KPI data' });
  }
});

// ============================================================================
// GET /api/dashboard/cost-trend
// ============================================================================
// Returns 30-day cost trend time-series + 5-day forecast
// Used for the main area chart on the dashboard
// ============================================================================
router.get('/cost-trend', (req, res) => {
  try {
    const trend = generateCostTrend();
    logger.debug('Generated cost trend data');
    res.json({ success: true, data: trend });
  } catch (error) {
    logger.error('Failed to generate cost trend:', error);
    res.status(500).json({ success: false, error: 'Failed to load cost trend' });
  }
});

// ============================================================================
// GET /api/dashboard/top-consumers
// ============================================================================
// Returns top resource consumers with cost and trend data
// Used for the "Top Consumers" table
// ============================================================================
router.get('/top-consumers', (req, res) => {
  try {
    const consumers = generateTopConsumers();
    logger.debug('Generated top consumers data');
    res.json({ success: true, data: consumers });
  } catch (error) {
    logger.error('Failed to generate top consumers:', error);
    res.status(500).json({ success: false, error: 'Failed to load top consumers' });
  }
});

// ============================================================================
// GET /api/dashboard/regions
// ============================================================================
// Returns cost breakdown by cloud region
// Used for the "Cost by Region" treemap
// ============================================================================
router.get('/regions', (req, res) => {
  try {
    const regions = generateRegions();
    logger.debug('Generated region data');
    res.json({ success: true, data: regions });
  } catch (error) {
    logger.error('Failed to generate regions:', error);
    res.status(500).json({ success: false, error: 'Failed to load region data' });
  }
});

// ============================================================================
// GET /api/dashboard/insights
// ============================================================================
// Returns AI copilot insights: anomalies, recommendations, actions
// Used for the "Copilot Insights" panel
// ============================================================================
router.get('/insights', (req, res) => {
  try {
    const insights = generateInsights();
    logger.debug('Generated AI insights');
    res.json({ success: true, data: insights });
  } catch (error) {
    logger.error('Failed to generate insights:', error);
    res.status(500).json({ success: false, error: 'Failed to load insights' });
  }
});

module.exports = router;
