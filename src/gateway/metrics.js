const promClient = require('prom-client');

// Initialize the default metrics (CPU, RAM, Event Loop Lag, etc.)
promClient.collectDefaultMetrics();

// Custom Application Metrics
const llmRequestLatency = new promClient.Histogram({
    name: 'llm_request_latency_ms',
    help: 'Latency of LLM requests in milliseconds',
    labelNames: ['model', 'provider', 'status_code'],
    buckets: [100, 500, 1000, 2000, 5000, 10000, 30000] // Buckets for response times
});

const llmTokensTotal = new promClient.Counter({
    name: 'llm_tokens_total',
    help: 'Total number of tokens processed (prompt + completion)',
    labelNames: ['model', 'api_key_id', 'type'] // type: 'prompt' or 'completion'
});

const cacheHitRatio = new promClient.Counter({
    name: 'semantic_cache_hits_total',
    help: 'Total number of semantic cache hits vs misses',
    labelNames: ['status'] // 'hit' or 'miss'
});

const activeConnections = new promClient.Gauge({
    name: 'gateway_active_connections',
    help: 'Number of currently active streaming connections'
});

module.exports = {
    promClient,
    metrics: {
        llmRequestLatency,
        llmTokensTotal,
        cacheHitRatio,
        activeConnections
    }
};
