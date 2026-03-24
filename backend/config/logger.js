const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");

const logger = createLogger({
    transports: [
        new LokiTransport({
            host: process.env.LOKI_HOST || "http://127.0.0.1:3100",
            labels: { app: "mock-api-server" },
        }),
    ],
});

module.exports = logger;
