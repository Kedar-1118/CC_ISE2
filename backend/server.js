const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

// ---------- Start Server ----------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`📡 API:  http://localhost:${PORT}/api`);
            console.log(`🔑 Auth: http://localhost:${PORT}/api/auth`);
            console.log(`🔗 Mock: http://localhost:${PORT}/api/{API_KEY}/{collection}`);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};


startServer();
