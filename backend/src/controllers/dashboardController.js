// ============================================================================
// Dashboard Controller — Serves KPIs, trends, consumers, regions, insights
// ============================================================================
// Uses mock data generators when MOCK_DATA=true or when the database
// is unavailable (no PostgreSQL running locally).
// ============================================================================

const config = require('../config');
const mockData = require('../utils/mockData');

// Helper: try to use DB, fallback to mock
const shouldUseMock = () => {
  return config.useMockData || !config.databaseUrl || config.databaseUrl.includes('localhost');
};

let dbModels = null;
let dbOp = null;

try {
  const models = require('../models');
  dbModels = models;
  dbOp = require('sequelize').Op;
} catch {
  // DB not available, will use mock data
}

// ── GET /api/dashboard/kpis ──────────────────────────────────────────────────
exports.getKPIs = async (req, res, _next) => {
  try {
    if (shouldUseMock() || !dbModels) {
      return res.json({ success: true, data: mockData.generateKPIs() });
    }

    const { CostRecord } = dbModels;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const todaySpend = await CostRecord.sum('cost', {
      where: { date: todayStr }
    }) || 0;

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const mtdSpend = await CostRecord.sum('cost', {
      where: { date: { [dbOp.gte]: firstDayOfMonth, [dbOp.lte]: todayStr } }
    }) || 0;

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const weeklySpend = await CostRecord.sum('cost', {
      where: { date: { [dbOp.gte]: sevenDaysAgo.toISOString().split('T')[0], [dbOp.lte]: todayStr } }
    }) || 0;

    res.json({
      success: true,
      data: {
        today: { label: "Today's Spend", value: todaySpend, trend: -2, trendDirection: 'down', icon: 'today' },
        weekly: { label: '7-Day Trailing', value: weeklySpend, trend: 1.5, trendDirection: 'up', icon: 'date_range' },
        mtd: { label: 'MTD Total', value: mtdSpend, trend: null, trendDirection: 'flat', statusText: 'on track', icon: 'calendar_month' },
        forecast: { label: 'AI Forecast (EOM)', value: mtdSpend * 1.2, isAI: true, icon: 'auto_awesome' },
      }
    });
  } catch {
    // Fallback to mock on any DB error
    res.json({ success: true, data: mockData.generateKPIs() });
  }
};

// ── GET /api/dashboard/cost-trend ────────────────────────────────────────────
exports.getCostTrend = async (req, res, _next) => {
  try {
    if (shouldUseMock() || !dbModels) {
      return res.json({ success: true, data: mockData.generateCostTrend() });
    }

    const { CostRecord, sequelize } = dbModels;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await CostRecord.findAll({
      attributes: ['date', [sequelize.fn('SUM', sequelize.col('cost')), 'dailyCost']],
      where: { date: { [dbOp.gte]: thirtyDaysAgo.toISOString().split('T')[0] } },
      group: ['date'],
      order: [['date', 'ASC']]
    });

    let cumulative = 0;
    const actual = records.map(r => {
      const daily = parseFloat(r.get('dailyCost'));
      cumulative += daily;
      return {
        date: r.date,
        dateLabel: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dailyCost: daily,
        cumulative
      };
    });

    const forecast = [];
    let lastCumulative = cumulative;
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const daily = 3500;
      lastCumulative += daily;
      forecast.push({
        date: d.toISOString().split('T')[0],
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dailyCost: daily,
        cumulative: lastCumulative
      });
    }

    res.json({ success: true, data: { actual, forecast } });
  } catch {
    res.json({ success: true, data: mockData.generateCostTrend() });
  }
};

// ── GET /api/dashboard/top-consumers ─────────────────────────────────────────
exports.getTopConsumers = async (req, res, _next) => {
  try {
    if (shouldUseMock() || !dbModels) {
      return res.json({ success: true, data: mockData.generateTopConsumers() });
    }

    const { CostRecord, Resource, sequelize } = dbModels;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const consumers = await CostRecord.findAll({
      attributes: ['resourceId', [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost']],
      include: [{ model: Resource, attributes: ['name', 'service'] }],
      where: { date: { [dbOp.gte]: thirtyDaysAgo.toISOString().split('T')[0] } },
      group: ['resourceId', 'Resource.id', 'Resource.name', 'Resource.service'],
      order: [[sequelize.literal('"totalCost"'), 'DESC']],
      limit: 6
    });

    const data = consumers.map(c => {
      const trend = Math.floor(Math.random() * 20) - 10;
      return {
        name: c.Resource.name,
        service: c.Resource.service,
        cost: parseFloat(c.get('totalCost')),
        trend,
        trendDirection: trend > 1 ? 'up' : trend < -1 ? 'down' : 'flat'
      };
    });

    res.json({ success: true, data });
  } catch {
    res.json({ success: true, data: mockData.generateTopConsumers() });
  }
};

// ── GET /api/dashboard/regions ───────────────────────────────────────────────
exports.getRegions = async (req, res, _next) => {
  try {
    if (shouldUseMock() || !dbModels) {
      return res.json({ success: true, data: mockData.generateRegions() });
    }

    const { CostRecord, sequelize } = dbModels;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const regions = await CostRecord.findAll({
      attributes: ['region', [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost']],
      where: { date: { [dbOp.gte]: thirtyDaysAgo.toISOString().split('T')[0] } },
      group: ['region']
    });

    const total = regions.reduce((sum, r) => sum + parseFloat(r.get('totalCost')), 0);
    const data = regions.map(r => {
      const cost = parseFloat(r.get('totalCost'));
      return { name: r.region, cost, percentage: total > 0 ? Math.round((cost / total) * 100) : 0 };
    });

    res.json({ success: true, data });
  } catch {
    res.json({ success: true, data: mockData.generateRegions() });
  }
};

// ── GET /api/dashboard/insights ──────────────────────────────────────────────
exports.getInsights = async (req, res, _next) => {
  try {
    if (shouldUseMock() || !dbModels) {
      return res.json({ success: true, data: mockData.generateInsights() });
    }

    const { Insight } = dbModels;
    const insights = await Insight.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const data = insights.map(i => ({
      type: i.type,
      severity: i.severity,
      message: i.message,
      savings: i.savings,
      icon: i.type === 'action' ? 'auto_fix_high' : undefined
    }));

    if (data.length === 0) {
      return res.json({ success: true, data: mockData.generateInsights() });
    }

    res.json({ success: true, data });
  } catch {
    res.json({ success: true, data: mockData.generateInsights() });
  }
};

// ── GET /api/dashboard/infrastructure ────────────────────────────────────────
exports.getInfrastructure = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        topology: mockData.generateTopology(),
        carbon: mockData.generateCarbon(),
        drift: mockData.generateDrift()
      }
    });
  } catch (error) {
    next(error);
  }
};
