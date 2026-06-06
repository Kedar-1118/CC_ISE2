const client = require('prom-client');

/**
 * Custom Application Metrics
 *
 * These complement the default Node.js metrics (CPU, memory, GC, event loop)
 * collected by `client.collectDefaultMetrics()` in server.js and the automatic
 * HTTP metrics from `express-prom-bundle`.
 */

// ── Mock API Requests ──────────────────────────────────────
const mockRequestsTotal = new client.Counter({
    name: 'mockapi_mock_requests_total',
    help: 'Total number of mock API requests',
    labelNames: ['method', 'collection', 'status_code'],
});

const mockRequestDuration = new client.Histogram({
    name: 'mockapi_mock_request_duration_seconds',
    help: 'Duration of mock API requests in seconds',
    labelNames: ['method', 'collection'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

// ── Project Management ─────────────────────────────────────
const projectsCreatedTotal = new client.Counter({
    name: 'mockapi_projects_created_total',
    help: 'Total number of projects created',
});

const projectsDeletedTotal = new client.Counter({
    name: 'mockapi_projects_deleted_total',
    help: 'Total number of projects deleted',
});

// ── Authentication ─────────────────────────────────────────
const authOperationsTotal = new client.Counter({
    name: 'mockapi_auth_operations_total',
    help: 'Total authentication operations',
    labelNames: ['operation'], // 'otp_sent', 'otp_verified', 'login', 'logout'
});

// ── Errors ─────────────────────────────────────────────────
const errorsTotal = new client.Counter({
    name: 'mockapi_errors_total',
    help: 'Total application errors by type',
    labelNames: ['error_type'], // 'ValidationError', 'CastError', 'ParseError', 'ServerError'
});

// ── Rate Limiting ──────────────────────────────────────────
const rateLimitHitsTotal = new client.Counter({
    name: 'mockapi_rate_limit_hits_total',
    help: 'Total number of rate limit rejections',
    labelNames: ['type'], // 'ip_rate_limit', 'weekly_rate_limit'
});

module.exports = {
    mockRequestsTotal,
    mockRequestDuration,
    projectsCreatedTotal,
    projectsDeletedTotal,
    authOperationsTotal,
    errorsTotal,
    rateLimitHitsTotal,
};
