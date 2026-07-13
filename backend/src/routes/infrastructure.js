// ============================================================================
// Infrastructure API Routes
// ============================================================================
//
// Endpoints for infrastructure monitoring data:
//   - Kubernetes cluster topology
//   - Carbon footprint metrics
//   - Terraform drift detection
//
// All endpoints prefixed with /api/infrastructure (set in server.js)
// ============================================================================

const express = require('express');
const router = express.Router();
const {
  generateTopology,
  generateCarbon,
  generateDrift,
} = require('../utils/mockData');
const logger = require('../utils/logger');

// ============================================================================
// GET /api/infrastructure/topology
// ============================================================================
router.get('/topology', (req, res) => {
  try {
    const topology = generateTopology();
    logger.debug('Generated K8s topology data');
    res.json({ success: true, data: topology });
  } catch (error) {
    logger.error('Failed to generate topology:', error);
    res.status(500).json({ success: false, error: 'Failed to load topology' });
  }
});

// ============================================================================
// GET /api/infrastructure/carbon
// ============================================================================
router.get('/carbon', (req, res) => {
  try {
    const carbon = generateCarbon();
    logger.debug('Generated carbon footprint data');
    res.json({ success: true, data: carbon });
  } catch (error) {
    logger.error('Failed to generate carbon data:', error);
    res.status(500).json({ success: false, error: 'Failed to load carbon data' });
  }
});

// ============================================================================
// GET /api/infrastructure/drift
// ============================================================================
router.get('/drift', (req, res) => {
  try {
    const drift = generateDrift();
    logger.debug('Generated Terraform drift data');
    res.json({ success: true, data: drift });
  } catch (error) {
    logger.error('Failed to generate drift data:', error);
    res.status(500).json({ success: false, error: 'Failed to load drift data' });
  }
});

module.exports = router;
