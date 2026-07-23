// ============================================================================
// CloudCostIQ — Express Server Entry Point
// ============================================================================
//
// LEARNING: This is where everything comes together. The server:
//   1. Loads configuration from environment variables
//   2. Sets up middleware (CORS, security, logging, parsing)
//   3. Mounts route handlers for each feature area
//   4. Serves the frontend static files
//   5. Starts listening for HTTP requests
//
// Middleware execution order matters! Security middleware goes first,
// then parsing, then logging, then your routes.
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const logger = require('./utils/logger');

// Route imports
const dashboardRoutes = require('./routes/dashboard');
const infrastructureRoutes = require('./routes/infrastructure');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { swaggerUi, swaggerDocs } = require('./docs/swagger');
const promClient = require('prom-client');

// ============================================================================
// Metrics Collection Setup
// ============================================================================
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});
register.registerMetric(httpRequestTotal);

// ============================================================================
// Create Express Application
// ============================================================================
const app = express();

// ============================================================================
// Middleware Stack
// ============================================================================

// --- Security Headers (Helmet) ---
// LEARNING: Helmet sets various HTTP headers to protect against common attacks:
//   - X-Content-Type-Options: nosniff (prevents MIME sniffing)
//   - X-Frame-Options: DENY (prevents clickjacking)
//   - Strict-Transport-Security (forces HTTPS)
//   - And many more...
app.use(helmet({
  // Relax CSP for development (we serve static HTML that loads CDN scripts)
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// --- CORS (Cross-Origin Resource Sharing) ---
// LEARNING: Browsers block requests from one origin (e.g., localhost:5173)
// to another (e.g., localhost:4000) by default. CORS headers tell the browser
// "it's OK, I trust requests from these origins."
app.use(cors({
  origin: [
    'http://localhost:5173',    // Vite dev server
    'http://localhost:3000',    // Alternative dev port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5500',   // VS Code Live Server
    'http://localhost:5500',
    /^file:\/\//,              // Allow local file:// protocol for HTML files
  ],
  credentials: true,
}));

// --- Body Parsing ---
// LEARNING: Express needs to be told how to parse incoming request bodies.
// express.json() parses JSON bodies (Content-Type: application/json)
// express.urlencoded() parses form data (Content-Type: application/x-www-form-urlencoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- HTTP Request Logging (Morgan) ---
// LEARNING: Morgan logs every HTTP request. The 'dev' format shows:
//   GET /api/dashboard/kpis 200 12ms - 1.2kb
// This is invaluable for debugging. In production, use 'combined' format.
// --- HTTP Request Logging & Metrics ---
app.use(morgan('dev', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Middleware to record metrics for each request
app.use((req, res, next) => {
  const startEpoch = Date.now();
  res.on('finish', () => {
    const responseTimeInSeconds = (Date.now() - startEpoch) / 1000;
    
    // Clean route path (to avoid high cardinality like /api/users/1234 -> /api/users/:id)
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(responseTimeInSeconds);
      
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  next();
});

// ============================================================================
// Serve Frontend Static Files
// ============================================================================
// LEARNING: express.static() serves files from a directory. When someone
// requests GET /, Express looks for index.html in the frontend folder.
// This means our backend also serves the frontend — single deployment!
app.use(express.static(path.join(__dirname, '../../frontend')));

// ============================================================================
// API Routes
// ============================================================================
// LEARNING: We "mount" each router at a specific path prefix.
// So dashboardRoutes' '/kpis' endpoint becomes '/api/dashboard/kpis'
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/infrastructure', infrastructureRoutes);
app.use('/api/auth', authRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ============================================================================
// Prometheus Metrics Endpoint
// ============================================================================
// Exposed for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ============================================================================
// Health Check Endpoint
// ============================================================================
// LEARNING: Every production service needs a health check endpoint.
// Kubernetes uses this to know if your service is alive (liveness probe)
// and ready to receive traffic (readiness probe).
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'cloudcostiq-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.env,
    mockData: config.useMockData,
  });
});

// ============================================================================
// Catch-All: Serve Frontend for Unknown Routes (SPA Support)
// ============================================================================
// LEARNING: For single-page apps, any unknown route should return index.html.
// The frontend router (React Router, etc.) handles the actual routing.
// We only do this for non-API routes to avoid masking 404s on API endpoints.
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// ============================================================================
// Global Error Handler
// ============================================================================
app.use(errorHandler);

// ============================================================================
// Start Server
// ============================================================================
const PORT = config.port;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ☁️  CloudCostIQ API Server                                 ║
║                                                              ║
║   🌐 Server:      http://localhost:${PORT}                    ║
║   📊 Dashboard:   http://localhost:${PORT}/dashboard.html     ║
║   🔧 Infra:       http://localhost:${PORT}/infrastructure.html║
║   💚 Health:      http://localhost:${PORT}/api/health          ║
║   🔄 Mode:        ${config.useMockData ? 'Mock Data' : 'Live Cloud APIs'}                        ║
║   🌍 Environment: ${config.env}                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
