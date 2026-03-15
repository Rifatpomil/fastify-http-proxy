const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// SQLite mock setup for Prisma
async function initializeVectorDB() {
    try {
        // In local demo mode, we just use a simple SQLite table since pgvector isn't available
        console.log("Mock SQLite Cache DB initialized.");
    } catch (err) {
        console.warn("Could not initialize DB:", err.message);
    }
}

/**
 * Generate a mock embedding
 */
async function generateEmbedding(text) {
    // Mock embedding representing text hashing
    return [1.0, 0.0, 0.5];
}

/**
 * Find a semantically similar prompt in the DB
 */
async function findSimilarPrompt(embedding, threshold = 0.95, originalPromptText = "") {
    // In our SQLite mock, we just do an exact query on the Prompt string.
    // In production, this uses pgvector cosine distance.
    const hash = crypto.createHash('sha256').update(originalPromptText).digest('hex');

    const match = await prisma.promptCache.findFirst({
        where: { promptHash: hash }
    });

    if (match) {
        console.log(`Cache Hit!`);
        return match.response;
    }
    return null;
}

/**
 * Save a new prompt and its response back into the Cache DB
 */
async function saveToCache(prompt, response, embedding) {
    const hash = crypto.createHash('sha256').update(prompt).digest('hex');

    await prisma.promptCache.create({
        data: {
            prompt: prompt,
            promptHash: hash,
            response: response
        }
    });
}

module.exports = {
    initializeVectorDB,
    generateEmbedding,
    findSimilarPrompt,
    saveToCache
};
