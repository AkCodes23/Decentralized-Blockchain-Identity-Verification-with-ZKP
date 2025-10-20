const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

const identityRoutes = require('./routes/identity');
const credentialRoutes = require('./routes/credentials');
const verificationRoutes = require('./routes/verification');

const app = express();
const PORT = process.env.PORT || 5000;

// Process-level error handling
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID + request logging
app.use((req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  logger.info(`→ ${req.method} ${req.originalUrl}`, { requestId: req.requestId });
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info(`← ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`, { requestId: req.requestId });
  });
  next();
});

// Routes
app.use('/api/identity', identityRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/verification', verificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// System status endpoint (used by frontend)
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Request error', { error: err.message, stack: err.stack, requestId: req.requestId });
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
