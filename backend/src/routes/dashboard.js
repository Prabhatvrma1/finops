const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// In production, we'd add the 'protect' middleware here to secure routes
// const { protect } = require('../middleware/auth');
// router.use(protect);

router.get('/kpis', dashboardController.getKPIs);
router.get('/cost-trend', dashboardController.getCostTrend);
router.get('/top-consumers', dashboardController.getTopConsumers);
router.get('/regions', dashboardController.getRegions);
router.get('/insights', dashboardController.getInsights);

module.exports = router;
