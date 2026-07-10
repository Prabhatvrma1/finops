// ============================================================================
// Database Connection — Sequelize ORM Setup
// ============================================================================
//
// LEARNING: An ORM (Object-Relational Mapper) lets you work with your database
// using JavaScript objects instead of raw SQL strings. Why?
//
//   Raw SQL (dangerous):
//     db.query(`SELECT * FROM users WHERE email = '${email}'`)
//     → This is vulnerable to SQL INJECTION! A hacker could input:
//       ' OR 1=1; DROP TABLE users; --
//
//   Sequelize ORM (safe):
//     User.findOne({ where: { email } })
//     → Sequelize automatically uses PARAMETERIZED QUERIES that prevent injection.
//
// Sequelize also handles:
//   - Connection pooling (reuse connections instead of creating new ones)
//   - Migrations (version-control your schema changes)
//   - Model definitions (define tables as JavaScript classes)
//   - Relationships (hasMany, belongsTo, etc.)
//
// ============================================================================

const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

// ============================================================================
// Create Sequelize Instance
// ============================================================================
// LEARNING: The connection URL format is:
//   postgres://username:password@hostname:port/database_name
//
// We pass additional options:
//   - dialect: tells Sequelize we're using PostgreSQL (not MySQL, SQLite, etc.)
//   - logging: pipe SQL queries through our Winston logger (only in dev)
//   - pool: manage a POOL of connections for better performance
// ============================================================================
const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',

  // LEARNING: Logging SQL queries helps you understand what Sequelize is doing.
  // In production, this is noisy, so we disable it.
  logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,

  // LEARNING: Connection Pooling
  // Instead of opening a new database connection for EVERY query (slow!),
  // we maintain a "pool" of open connections that get reused.
  //   - max: 10 means at most 10 simultaneous connections
  //   - min: 0 means we can close all connections when idle (saves resources)
  //   - acquire: 30000ms = 30 seconds to wait for a connection before erroring
  //   - idle: 10000ms = close a connection after 10 seconds of no use
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  // LEARNING: These Sequelize options match PostgreSQL best practices
  define: {
    timestamps: true,        // Automatically add createdAt and updatedAt columns
    underscored: true,       // Use snake_case for column names (PostgreSQL convention)
    freezeTableName: true,   // Don't pluralize table names (User → users → no, keep "users")
  },
});

// ============================================================================
// Test Connection
// ============================================================================
// LEARNING: We call this on startup to verify the database is reachable.
// authenticate() sends a simple query (SELECT 1+1) to check connectivity.
// ============================================================================
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
  } catch (error) {
    logger.error('❌ Unable to connect to database:', error.message);
    // LEARNING: In production, you might want to retry a few times before crashing,
    // because the database might still be starting up (especially in Kubernetes).
    // For now, we log the error but don't crash — the app will retry on requests.
  }
};

// ============================================================================
// Sync Models (Development Only)
// ============================================================================
// LEARNING: sync() creates database tables from your model definitions.
//   - { force: true }  → DROP and recreate tables (DESTROYS DATA!)
//   - { alter: true }  → Modify tables to match models (safer, but still risky)
//   - No options        → Create tables only if they don't exist (safest)
//
// In production, ALWAYS use migrations instead of sync(). Migrations are
// version-controlled SQL changes that can be applied and rolled back.
// ============================================================================
const syncDatabase = async () => {
  try {
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database models synchronized');
    }
  } catch (error) {
    logger.error('❌ Database sync failed:', error.message);
  }
};

module.exports = { sequelize, testConnection, syncDatabase };
