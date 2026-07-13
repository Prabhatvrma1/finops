// ============================================================================
// Mock Data Generator — Realistic Fake Data for Development
// ============================================================================
//
// LEARNING: When building a FinOps platform, you don't want to hit real cloud
// APIs during development (costs money, requires credentials, slow).
// Instead, we generate realistic fake data that mimics real cloud cost patterns.
//
// This module generates:
//   - KPI metrics (daily, weekly, monthly spend + AI forecast)
//   - 30-day cost trend time-series
//   - Top consumer resources with service breakdowns
//   - Regional cost distribution
//   - AI copilot insights
//   - Infrastructure topology & Terraform drift data
// ============================================================================

// ============================================================================
// Helper: Random number in range
// ============================================================================
function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// Dashboard KPIs
// ============================================================================
function generateKPIs() {
  const todaySpend = rand(2800, 4200);
  const weeklySpend = rand(20000, 28000);
  const mtdSpend = rand(75000, 100000);
  const forecast = rand(105000, 125000);

  return {
    today: {
      label: "Today's Spend",
      value: todaySpend,
      trend: rand(-5, 5),
      trendDirection: Math.random() > 0.5 ? 'down' : 'up',
      icon: 'today',
    },
    weekly: {
      label: '7-Day Trailing',
      value: weeklySpend,
      trend: rand(-3, 6),
      trendDirection: Math.random() > 0.4 ? 'up' : 'down',
      icon: 'date_range',
    },
    mtd: {
      label: 'MTD Total',
      value: mtdSpend,
      trend: null,
      trendDirection: 'flat',
      statusText: 'on track',
      icon: 'calendar_month',
    },
    forecast: {
      label: 'AI Forecast (EOM)',
      value: forecast,
      isAI: true,
      icon: 'auto_awesome',
    },
  };
}

// ============================================================================
// 30-Day Cost Trend
// ============================================================================
function generateCostTrend() {
  const days = 30;
  const data = [];
  const now = new Date();
  let cumulative = 0;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate realistic daily spend with some variance
    const baseSpend = rand(2500, 4500);
    // Weekends tend to be lower
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.65 : 1;
    const dailyCost = baseSpend * weekendFactor;
    cumulative += dailyCost;

    data.push({
      date: date.toISOString().split('T')[0],
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dailyCost: Math.round(dailyCost),
      cumulative: Math.round(cumulative),
    });
  }

  // Add 5-day forecast (dashed line)
  const forecast = [];
  let lastCumulative = cumulative;
  for (let i = 1; i <= 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dailyCost = rand(2800, 4800);
    lastCumulative += dailyCost;
    forecast.push({
      date: date.toISOString().split('T')[0],
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dailyCost: Math.round(dailyCost),
      cumulative: Math.round(lastCumulative),
    });
  }

  return { actual: data, forecast };
}

// ============================================================================
// Top Consumer Resources
// ============================================================================
function generateTopConsumers() {
  const resources = [
    { name: 'db-prod-cluster-01', service: 'RDS', costRange: [10000, 15000], trendRange: [5, 18] },
    { name: 'eks-prod-nodes', service: 'EC2', costRange: [6000, 10000], trendRange: [-8, 2] },
    { name: 's3-data-lake-raw', service: 'S3', costRange: [3000, 5500], trendRange: [-2, 2] },
    { name: 'redis-cache-main', service: 'ElastiCache', costRange: [2000, 4000], trendRange: [-5, 1] },
    { name: 'lambda-api-handlers', service: 'Lambda', costRange: [1500, 3000], trendRange: [2, 12] },
    { name: 'cloudfront-cdn-prod', service: 'CloudFront', costRange: [1000, 2500], trendRange: [-3, 5] },
  ];

  return resources.map((r) => {
    const cost = randInt(r.costRange[0], r.costRange[1]);
    const trend = rand(r.trendRange[0], r.trendRange[1]);
    return {
      name: r.name,
      service: r.service,
      cost,
      trend: Math.round(trend),
      trendDirection: trend > 1 ? 'up' : trend < -1 ? 'down' : 'flat',
    };
  });
}

// ============================================================================
// Cost by Region
// ============================================================================
function generateRegions() {
  const totalBudget = rand(80000, 100000);
  const regions = [
    { name: 'us-east-1', percentage: rand(40, 50) },
    { name: 'eu-west-1', percentage: rand(20, 28) },
    { name: 'ap-south-1', percentage: rand(10, 18) },
  ];

  // Calculate "other" as remainder
  const allocated = regions.reduce((sum, r) => sum + r.percentage, 0);
  regions.push({ name: 'other', percentage: Math.round(100 - allocated) });

  return regions.map((r) => ({
    name: r.name,
    percentage: Math.round(r.percentage),
    cost: Math.round(totalBudget * (r.percentage / 100)),
  }));
}

// ============================================================================
// AI Copilot Insights
// ============================================================================
function generateInsights() {
  const anomalies = [
    {
      type: 'anomaly',
      severity: 'high',
      message: `EKS Cluster <code>us-east-prod-1</code> experienced a ${randInt(30, 60)}% spend spike over the last ${randInt(6, 24)} hours.`,
    },
    {
      type: 'anomaly',
      severity: 'medium',
      message: `S3 bucket <code>data-lake-raw</code> transfer costs increased ${randInt(15, 40)}% — possible misconfigured replication.`,
    },
  ];

  const recommendations = [
    {
      type: 'recommendation',
      message: `Downscale unused node groups in <code>us-west-dev</code>. Estimated savings: $${randInt(300, 600)}/mo.`,
      savings: randInt(300, 600),
    },
    {
      type: 'recommendation',
      message: `Switch ${randInt(3, 8)} RDS instances to Reserved pricing. Estimated savings: $${randInt(800, 1500)}/mo.`,
      savings: randInt(800, 1500),
    },
    {
      type: 'recommendation',
      message: `Delete ${randInt(5, 15)} unattached EBS volumes in us-east-1. Estimated savings: $${randInt(100, 300)}/mo.`,
      savings: randInt(100, 300),
    },
  ];

  const actions = [
    {
      type: 'action',
      message: 'Generating optimization script...',
      icon: 'auto_fix_high',
    },
  ];

  // Return a random mix
  return [
    anomalies[randInt(0, anomalies.length - 1)],
    recommendations[randInt(0, recommendations.length - 1)],
    actions[0],
  ];
}

// ============================================================================
// Infrastructure — Kubernetes Topology
// ============================================================================
function generateTopology() {
  const clusters = [
    {
      name: 'us-east-prod-1',
      provider: 'AWS EKS',
      region: 'us-east-1',
      status: 'healthy',
      nodes: randInt(6, 12),
      pods: randInt(45, 120),
      cpuUsage: rand(40, 85),
      memoryUsage: rand(50, 80),
      namespaces: [
        { name: 'default', pods: randInt(2, 5), status: 'active' },
        { name: 'monitoring', pods: randInt(3, 8), status: 'active' },
        { name: 'production', pods: randInt(15, 40), status: 'active' },
        { name: 'staging', pods: randInt(5, 15), status: 'active' },
      ],
    },
    {
      name: 'eu-west-staging',
      provider: 'AWS EKS',
      region: 'eu-west-1',
      status: 'healthy',
      nodes: randInt(3, 6),
      pods: randInt(20, 50),
      cpuUsage: rand(20, 55),
      memoryUsage: rand(30, 60),
      namespaces: [
        { name: 'default', pods: randInt(1, 3), status: 'active' },
        { name: 'staging', pods: randInt(10, 25), status: 'active' },
      ],
    },
  ];

  return clusters;
}

// ============================================================================
// Infrastructure — Carbon Footprint
// ============================================================================
function generateCarbon() {
  return {
    currentEmissions: rand(10, 16),
    unit: 'tCO2e',
    weeklyChange: rand(-5, 2),
    monthlyTrend: [
      rand(11, 15), rand(10, 14), rand(12, 16), rand(9, 13),
    ],
    breakdown: {
      compute: rand(5, 8),
      storage: rand(2, 4),
      networking: rand(1, 3),
    },
  };
}

// ============================================================================
// Infrastructure — Terraform Drift
// ============================================================================
function generateDrift() {
  const driftItems = [
    {
      resource: 'aws_db_instance.main',
      status: 'Modified',
      changes: [
        { field: 'instance_class', from: 'db.t3.micro', to: 'db.t3.medium' },
      ],
      context: [
        { type: 'unchanged', value: '  allocated_storage = 20' },
        { type: 'removed', value: '- instance_class    = "db.t3.micro"' },
        { type: 'added', value: '+ instance_class    = "db.t3.medium"' },
        { type: 'unchanged', value: '  engine            = "postgres"' },
      ],
    },
    {
      resource: 'aws_s3_bucket.data_lake',
      status: 'Modified',
      changes: [
        { field: 'versioning.enabled', from: 'false', to: 'true' },
      ],
      context: [
        { type: 'unchanged', value: '  bucket = "prod-data-lake-01"' },
        { type: 'unchanged', value: '  versioning {' },
        { type: 'removed', value: '-   enabled = false' },
        { type: 'added', value: '+   enabled = true' },
        { type: 'unchanged', value: '  }' },
      ],
    },
    {
      resource: 'aws_security_group.api_sg',
      status: 'Added',
      changes: [
        { field: 'ingress.cidr_blocks', from: null, to: '0.0.0.0/0' },
      ],
      context: [
        { type: 'added', value: '+ ingress {' },
        { type: 'added', value: '+   from_port   = 443' },
        { type: 'added', value: '+   to_port     = 443' },
        { type: 'added', value: '+   cidr_blocks = ["0.0.0.0/0"]' },
        { type: 'added', value: '+ }' },
      ],
    },
  ];

  // Return 2-3 random drift items
  const count = randInt(2, 3);
  return driftItems.slice(0, count);
}

// ============================================================================
// Export all generators
// ============================================================================
module.exports = {
  generateKPIs,
  generateCostTrend,
  generateTopConsumers,
  generateRegions,
  generateInsights,
  generateTopology,
  generateCarbon,
  generateDrift,
};
