const { CostRecord, Resource, Insight, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getKPIs = async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    const todayStr = today.toISOString().split('T')[0];

    // Today's Spend
    const todaySpend = await CostRecord.sum('cost', {
      where: { date: todayStr }
    }) || 0;

    // We can use mock-like static values or basic logic if real calculation is too complex
    // For a real app, you'd calculate the trend by comparing today to yesterday
    
    // MTD (Month to Date) Spend
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const mtdSpend = await CostRecord.sum('cost', {
      where: {
        date: {
          [Op.gte]: firstDayOfMonth,
          [Op.lte]: todayStr
        }
      }
    }) || 0;

    // 7-day trailing
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const weeklySpend = await CostRecord.sum('cost', {
      where: {
        date: {
          [Op.gte]: sevenDaysAgoStr,
          [Op.lte]: todayStr
        }
      }
    }) || 0;

    res.json({
      success: true,
      data: {
        today: { label: "Today's Spend", value: todaySpend, trend: -2, trendDirection: 'down', icon: 'today' },
        weekly: { label: '7-Day Trailing', value: weeklySpend, trend: 1.5, trendDirection: 'up', icon: 'date_range' },
        mtd: { label: 'MTD Total', value: mtdSpend, trend: null, trendDirection: 'flat', statusText: 'on track', icon: 'calendar_month' },
        forecast: { label: 'AI Forecast (EOM)', value: mtdSpend * 1.2, isAI: true, icon: 'auto_awesome' }, // Simple forecast
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCostTrend = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const records = await CostRecord.findAll({
      attributes: [
        'date',
        [sequelize.fn('SUM', sequelize.col('cost')), 'dailyCost']
      ],
      where: {
        date: {
          [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0]
        }
      },
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
        cumulative: cumulative
      };
    });

    // Mock forecast for the next 5 days
    const forecast = [];
    let lastCumulative = cumulative;
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const daily = 3500; // Mock average daily
      lastCumulative += daily;
      forecast.push({
        date: d.toISOString().split('T')[0],
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dailyCost: daily,
        cumulative: lastCumulative
      });
    }

    res.json({ success: true, data: { actual, forecast } });
  } catch (error) {
    next(error);
  }
};

exports.getTopConsumers = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const consumers = await CostRecord.findAll({
      attributes: [
        'resourceId',
        [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost']
      ],
      include: [{ model: Resource, attributes: ['name', 'service'] }],
      where: {
        date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] }
      },
      group: ['resourceId', 'Resource.id', 'Resource.name', 'Resource.service'],
      order: [[sequelize.literal('"totalCost"'), 'DESC']],
      limit: 6
    });

    const data = consumers.map(c => ({
      name: c.Resource.name,
      service: c.Resource.service,
      cost: parseFloat(c.get('totalCost')),
      trend: Math.floor(Math.random() * 20) - 10, // Mock trend
      trendDirection: 'flat' // To be calculated properly in a real scenario
    })).map(c => ({
      ...c,
      trendDirection: c.trend > 1 ? 'up' : c.trend < -1 ? 'down' : 'flat'
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getRegions = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const regions = await CostRecord.findAll({
      attributes: [
        'region',
        [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost']
      ],
      where: {
        date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] }
      },
      group: ['region']
    });

    const total = regions.reduce((sum, r) => sum + parseFloat(r.get('totalCost')), 0);
    
    const data = regions.map(r => {
      const cost = parseFloat(r.get('totalCost'));
      return {
        name: r.region,
        cost: cost,
        percentage: total > 0 ? Math.round((cost / total) * 100) : 0
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getInsights = async (req, res, next) => {
  try {
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

    // Fallback if empty
    if (data.length === 0) {
      data.push({
        type: 'recommendation',
        severity: 'low',
        message: 'No insights available. Ensure your cloud accounts are connected.',
        savings: 0
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
