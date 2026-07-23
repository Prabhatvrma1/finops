const logger = require('../utils/logger');
const config = require('../config');

exports.errorHandler = (err, req, res, _next) => {
  logger.error('Unhandled error:', err);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    error: config.env === 'development' ? err.message : 'Internal server error',
    stack: config.env === 'development' ? err.stack : undefined,
  });
};
