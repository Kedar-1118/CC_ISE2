const { createLogger, format, transports } = require("winston");
const LokiTransport = require("winston-loki");

const LOKI_HOST = process.env.LOKI_HOST || "http://127.0.0.1:3100";
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Winston Logger — dual transport:
 *   1. Console  → coloured, human-readable (always active)
 *   2. Loki     → structured JSON pushed to Grafana Loki for dashboard queries
 */
const transportOptions = [];

if (NODE_ENV === "test") {
    // Silent console during test runs
    transportOptions.push(
        new transports.Console({
            silent: true,
        })
    );
} else {
    transportOptions.push(
        // ── Console (always) ──────────────────────────────
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ timestamp, level, message, ...meta }) => {
                    const metaStr = Object.keys(meta).length > 2 // exclude service & timestamp
                        ? ` ${JSON.stringify(meta)}`
                        : "";
                    return `${timestamp} [${level}]: ${message}${metaStr}`;
                })
            ),
        }),

        // ── Loki (for Grafana log panels) ─────────────────
        new LokiTransport({
            host: LOKI_HOST,
            labels: { app: "mock-api-server", env: NODE_ENV },
            json: true,
            format: format.json(),
            replaceTimestamp: true,
            onConnectionError: (err) => {
                console.error(`⚠️  Loki connection error (${LOKI_HOST}):`, err.message);
            },
        })
    );
}

const logger = createLogger({
    level: NODE_ENV === "production" ? "info" : "debug",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.json()
    ),
    defaultMeta: { service: "mock-api-server" },
    transports: transportOptions,
});

module.exports = logger;
