const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
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

// Custom request logger for /mock/* routes (logs to DB)
app.use(requestLogger);

// ---------- Routes ----------

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Project management
app.use('/api/projects', projectRoutes);

// Dynamic mock API engine
app.use('/mock', mockRoutes);

// ---------- Error Handling ----------

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// ---------- Start Server ----------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`📡 API:  http://localhost:${PORT}/api`);
        console.log(`🔗 Mock: http://localhost:${PORT}/mock`);
    });
};

startServer();
