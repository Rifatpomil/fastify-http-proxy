const { encoding_for_model } = require('tiktoken');

/**
 * Counts the number of tokens in a standard OpenAI chat completion request.
 * 
 * @param {Array} messages - The array of message objects {role: "user", content: "..."}
 * @param {string} model - The model name (e.g. "gpt-4o", "gpt-3.5-turbo")
 * @returns {number} The estimated token count
 */
function countTokens(messages, model = 'gpt-4o') {
  try {
    const enc = encoding_for_model(model);
    
    // Each message has a base overhead
    let tokensPerMessage = 3;
    let tokensPerName = 1;

    let numTokens = 0;
    
    for (const message of messages) {
      numTokens += tokensPerMessage;
      for (const [key, value] of Object.entries(message)) {
        if (typeof value === 'string') {
          numTokens += enc.encode(value).length;
        }
        if (key === 'name') {
          numTokens += tokensPerName;
        }
      }
    }
    
    // Reply priming overhead
    numTokens += 3;
    
    // We must free the encoding when done
    enc.free();
    
    return numTokens;
  } catch (err) {
    console.error("Token counting error:", err);
    // If we fail to count (e.g., unsupported model), return a safe fallback estimate
    return 1000;
  }
}

module.exports = {
  countTokens
};
