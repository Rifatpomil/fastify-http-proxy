// Mocking Redis and BullMQ for local demo mode (Docker failed to pull Redis)
class MockQueue {
    async add(name, data, opts) {
        console.log(`[Queue Mock] Added job ${name} with priority ${opts.priority}`);
        return { id: Math.random().toString(36).substr(2, 9) };
    }
}

// Our main queue for holding LLM requests that hit rate limits
const llmRequestQueue = new MockQueue();

/**
 * Adds a request to the queue.
 * Priority 1 is highest (for premium users / high priority API keys).
 * Priority 10 is default.
 */
async function enqueueRequest(reqData, priority = 10) {
    const job = await llmRequestQueue.add('process-llm', reqData, {
        priority,
        removeOnComplete: true,
        removeOnFail: false
    });
    return job;
}

// In a real production system, the worker would pop from the queue and actually execute the HTTP request to OpenAI.
// For this gateway, we act as a proxy, so we often want to block the incoming HTTP request until the queue says it's okay to proceed (Token bucket).

// Simple In-Memory Token Bucket for Rate Limiting / TPM tracking (Mocking Redis Pipeline)
const memoryRateLimits = new Map();

/**
 * Check if an API key has enough tokens remaining in the current minute window.
 * Returns { allowed: boolean, remaining: number }
 */
async function checkRateLimit(apiKey, requiredTokens, tpmLimit) {
    const timeWindow = Math.floor(Date.now() / 60000);
    const key = `rate_limit:${apiKey}:${timeWindow}`;

    let currentUsage = memoryRateLimits.get(key) || 0;
    currentUsage += requiredTokens;
    memoryRateLimits.set(key, currentUsage);

    // Cleanup old keys (naive approach for mock)
    if (Math.random() < 0.05) {
        for (const k of memoryRateLimits.keys()) {
            if (!k.endsWith(timeWindow.toString())) memoryRateLimits.delete(k);
        }
    }

    if (currentUsage > tpmLimit) {
        return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: tpmLimit - currentUsage };
}

module.exports = {
    llmRequestQueue,
    enqueueRequest,
    checkRateLimit
};
