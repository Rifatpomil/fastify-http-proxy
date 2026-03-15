const Fastify = require('fastify');
const proxy = require('../../index.js');
const { PrismaClient } = require('@prisma/client');
const { countTokens } = require('./token-counter');
const { checkRateLimit, enqueueRequest } = require('./queue');
const { SSETokenStream } = require('./interceptor');

const prisma = new PrismaClient();
const server = Fastify({ logger: true });

// We need to disable proxyPayloads to parse JSON in fastify, so we can read body.messages
server.register(proxy, {
    upstream: 'https://api.openai.com',
    prefix: '/v1',
    proxyPayloads: false, // Allows Fastify to parse JSON body

    preHandler: async (request, reply) => {
        // 1. Authenticate Request
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer qf_')) {
            return reply.code(401).send({ error: "Invalid or missing QueueFlow API Key. Key must start with 'qf_'" });
        }

        const keyString = authHeader.split(' ')[1];
        const apiKey = await prisma.apiKey.findUnique({ where: { key: keyString } });

        if (!apiKey) {
            return reply.code(401).send({ error: "API Key not found in Control Plane" });
        }

        // Assign apiKey to request context for later
        request.qfApiKey = apiKey;

        // 2. Intelligent Routing & Token Counting
        // If it's a chat completions request, inspect the body
        if (request.url.includes('/chat/completions') && request.body && request.body.messages) {
            const estimatedTokens = countTokens(request.body.messages, request.body.model);
            request.qfPromptTokens = estimatedTokens;

            // Intelligent Routing:
            // If the user requested gpt-4 or gpt-4o, but prompt is very simple (< 50 tokens), 
            // we might route to gpt-4o-mini (as an example of intelligent fallback)
            if (estimatedTokens < 50 && request.body.model.includes('gpt-4')) {
                request.log.info("Intelligent routing triggered: Downgrading to gpt-4o-mini to save cost on a tiny prompt.");
                request.body.model = 'gpt-4o-mini';
            }

            // 3. Rate Limiting & Priority Queuing
            const { allowed, remaining } = await checkRateLimit(apiKey.id, estimatedTokens, apiKey.tpmLimit);

            if (!allowed) {
                if (apiKey.priorityQueue) {
                    // If queue is enabled, we put it in the queue and wait for it to be processed
                    // In a real system you'd hold the connection and resolve it via BullMQ events
                    request.log.info("Rate limit exceeded, placing in Priority Queue...");
                    // const job = await enqueueRequest({...}, 1);
                    // For now, we simulate waiting:
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    return reply.code(429).send({ error: "QueueFlow TPM Rate Limit Exceeded", remainingTokens: remaining });
                }
            }
        }

        // Rewrite Authorization header to the REAL OpenAI key (from env) before it hits OpenAI
        request.headers['authorization'] = `Bearer ${process.env.OPENAI_API_KEY}`;
    },

    replyOptions: {
        // 4. Intercept the upstream response before sending it back to the client
        onResponse: (request, reply, res) => {
            // If this is a streaming request, res is a stream.
            if (request.body && request.body.stream) {
                // Create our SSE interceptor
                const interceptor = new SSETokenStream((finalTokenCount) => {
                    // Asynchronously log to Postgres without blocking the stream
                    prisma.requestLog.create({
                        data: {
                            apiKeyId: request.qfApiKey.id,
                            promptTokens: request.qfPromptTokens || 0,
                            completionTokens: finalTokenCount,
                            totalTokens: (request.qfPromptTokens || 0) + finalTokenCount,
                            model: request.body.model || 'unknown',
                            latencyMs: 0, // Calculate accurate latency later
                        }
                    }).catch(err => request.log.error("Failed to write token log", err));
                });

                // Pipe the OpenAI response through our interceptor, then to the client
                reply.send(res.pipe(interceptor));
            } else {
                // Non-streaming response, just forward it directly
                reply.send(res);
            }
        }
    }
});

const { promClient } = require('./metrics');

server.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', promClient.register.contentType);
    return promClient.register.metrics();
});

server.get('/', async (request, reply) => {
    return {
        service: "QueueFlow AI Gateway",
        status: "online",
        endpoints: {
            proxy: "/v1",
            metrics: "/metrics"
        }
    };
});

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' });
        server.log.info(`QueueFlow AI Gateway listening on ${server.server.address().port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
