const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const client = require('prom-client');
const promBundle = require('express-prom-bundle');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const logger = require('./config/logger');
const projectRoutes = require('./routes/projectRoutes');
const mockRoutes = require('./routes/mockRoutes');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// ---------- Security Middleware ----------

// Helmet: sets various HTTP headers for security
app.use(helmet());

// CORS: allow frontend origin
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    })
);

// Rate limiting: max 200 requests per minute per IP
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' },
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    },
});
app.use(limiter);

// ---------- Body Parsing ----------

// JSON body parser with 1MB limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---------- Logging ----------

// HTTP request logging in development
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Log every incoming request to Loki
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, { labels: { route: req.originalUrl, method: req.method } });
    next();
});

// Custom request logger for /mock/* routes (logs to DB)
app.use(requestLogger);

// ---------- Prometheus Metrics ----------

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics();

// HTTP metrics middleware (must be registered before routes)
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
});
app.use(metricsMiddleware);

// ---------- Routes ----------

// Health check
app.get('/api/health', (req, res) => {
    logger.info('Health check hit');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Project management
app.use('/api/projects', projectRoutes);

// Dynamic mock API engine
app.use('/mock', mockRoutes);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// ---------- Error Handling ----------

// 404 handler
app.use((req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, { labels: { status: '404' } });
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// ---------- Start Server ----------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`📡 API:  http://localhost:${PORT}/api`);
            console.log(`🔗 Mock: http://localhost:${PORT}/mock`);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
