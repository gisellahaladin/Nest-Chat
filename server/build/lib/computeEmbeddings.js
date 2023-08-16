"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEmbeddingScores = void 0;
const openai_1 = require("./openai");
function computeEmbeddingScores(searchEmbedding, embeddings) {
    const scores = [];
    for (const embedding of embeddings) {
        const similarity = (0, openai_1.cosineSimilarity)(searchEmbedding, embedding.embedding.data[0].embedding);
        scores.push({
            similarity,
            url: embedding.url,
            plainText: embedding.plaintext,
        });
    }
    scores.sort((a, b) => b.similarity - a.similarity);
    return scores;
}
exports.computeEmbeddingScores = computeEmbeddingScores;
