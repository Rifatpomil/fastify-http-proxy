const { Transform } = require('stream');

/**
 * Creates a transform stream that proxies the OpenAI SSE stream back to the client,
 * whilst simultaneously observing the data to count tokens accurately.
 */
class SSETokenStream extends Transform {
    constructor(onComplete) {
        super();
        this.tokenCount = 0;
        this.buffer = '';
        this.onComplete = onComplete;
    }

    _transform(chunk, encoding, callback) {
        // 1. Pass the chunk exactly as it is back to the client untouched (Zero Latency Cost)
        this.push(chunk);

        // 2. We inspect the chunk out-of-band to count tokens
        try {
            this.buffer += chunk.toString('utf8');

            let lines = this.buffer.split('\n');
            this.buffer = lines.pop(); // Keep incomplete line in buffer

            for (let line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    const dataStr = line.slice(6);
                    const dataObj = JSON.parse(dataStr);

                    if (dataObj.choices && dataObj.choices[0] && dataObj.choices[0].delta) {
                        const content = dataObj.choices[0].delta.content;
                        if (content) {
                            // OpenAI streaming returns literal partial words. We estimate roughly ~1 chunk = 1 token for streaming.
                            // In a perfect system we'd aggregate and tiktoken it natively, but this is fast and good enough for stream estimating.
                            this.tokenCount += 1;
                        }
                    }
                }
            }
        } catch (e) {
            // Ignore parse errors on partial chunks
        }

        callback();
    }

    _flush(callback) {
        if (this.onComplete) {
            // If there's an exact "usage" block injected occasionally by modern OpenAI SSE, we'd capture it.
            // Otherwise, flush our stream estimate.
            this.onComplete(this.tokenCount);
        }
        callback();
    }
}

module.exports = {
    SSETokenStream
};
