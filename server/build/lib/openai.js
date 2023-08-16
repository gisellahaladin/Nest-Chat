"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatBotResponse = exports.getContextForMessage = exports.assertIsEmbedding = exports.cosineSimilarity = void 0;
const openai_1 = require("openai");
const dotenv = require("dotenv");
const computeEmbeddings_1 = require("./computeEmbeddings");
const bot_1 = require("./bot");
const cache_1 = require("./cache");
const embeddings_1 = require("./../botKnowledge/generated/embeddings");
dotenv.config();
const OPENAI_API_SECRET = process.env.OPENAI_API_SECRET;
const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL;
const configuration = new openai_1.Configuration({
    apiKey: OPENAI_API_SECRET,
});
const openai = new openai_1.OpenAIApi(configuration);
function dot(a, b) {
    return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
}
function norm(v) {
    return Math.sqrt(dot(v, v));
}
function cosineSimilarity(a, b) {
    return dot(a, b) / (norm(a) * norm(b));
}
exports.cosineSimilarity = cosineSimilarity;
// Strong-handing the types from the network to make sure we're not
// accepting garbage.
function assertIsEmbedding(thing) {
    if (thing &&
        typeof thing === 'object' &&
        'data' in thing &&
        Array.isArray(thing.data) &&
        thing.data[0] &&
        typeof thing.data[0] === 'object' &&
        'embedding' in thing.data[0] &&
        Array.isArray(thing.data[0].embedding)) {
        return thing;
    }
    throw new Error('Invalid CreateEmbeddingResponse');
}
exports.assertIsEmbedding = assertIsEmbedding;
async function createEmbedding(openai, input) {
    const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input,
    });
    const res = assertIsEmbedding(response.data);
    return res.data[0].embedding;
}
async function getContextForMessage(mostRecentMessage, convo) {
    const [mostRecentMessageVector, convoVector] = await Promise.all([
        createEmbedding(openai, mostRecentMessage),
        createEmbedding(openai, convo),
    ]);
    const sourceData = embeddings_1.default.filter((embedding) => {
        if (embedding && 'embedding' && embedding) {
            return embedding;
        }
    });
    const mostRecentMessageScores = (0, computeEmbeddings_1.computeEmbeddingScores)(mostRecentMessageVector, sourceData);
    const convVectorScores = (0, computeEmbeddings_1.computeEmbeddingScores)(convoVector, sourceData);
    const context = [];
    let charCount = 0;
    const seen = new Set([]);
    const both = [...mostRecentMessageScores, ...convVectorScores];
    for (let s of both) {
        if (seen.has(s.plainText)) {
            continue;
        }
        seen.add(s.plainText);
        if (charCount + s.plainText.length < 8000) {
            context.push('\n');
            let url = s.url;
            if (url.startsWith('/')) {
                url = 'https://docs.cord.com' + url;
            }
            if (s.url !== '') {
                // context.push(`\n\nURL: ${CORD_DOCS_ORIGIN}` + s.url + '\n');
            }
            console.log(s.similarity, s.url);
            context.push('\n\n');
            context.push(s.plainText);
            charCount += s.plainText.length;
        }
        else {
            break;
        }
    }
    return context.join(' ');
}
exports.getContextForMessage = getContextForMessage;
async function getChatBotResponse(threadID, mostRecentMessage, convo, isRetry = false) {
    let contentForOpenAI = convo;
    const convoWithoutPrompt = convo.substring(convo.indexOf(bot_1.CONTENT_START));
    let context = '';
    try {
        context = await getContextForMessage(mostRecentMessage, convoWithoutPrompt);
    }
    catch (e) {
        console.log('Failed to get context for string');
    }
    if (context === '') {
        try {
            context = await getContextForMessage(mostRecentMessage, convoWithoutPrompt);
        }
        catch (e) {
            console.log('Failed to get context for string twice');
        }
    }
    contentForOpenAI = contentForOpenAI.replace(bot_1.BOT_CONTEXT, context);
    contentForOpenAI += '\n' + bot_1.BOT_USER_NAME + ': ';
    let reply = '';
    try {
        console.log('Calling OpenAI: ');
        console.log('-------------------------------------');
        const r = await openai.createChatCompletion({
            model: OPENAI_API_MODEL,
            messages: [
                {
                    role: 'user',
                    content: contentForOpenAI,
                },
            ],
        });
        if (!r.data.choices[0].message) {
            cache_1.conversationCache[threadID] += '\n\n';
            return '';
        }
        console.log('_______________');
        reply = r.data.choices[0].message.content ?? '';
        console.log('Reply:', reply);
        console.log('_______________');
    }
    catch (e) {
        console.log(e);
        (0, cache_1.initializeConversationWithPrompt)(threadID);
        reply =
            "Sorry -- I had a little brainfart. I've probably forgotten everything we talked about.";
    }
    // This is probably dead code now, effectively, since we're being smarter about context.
    if (reply.includes(bot_1.BOT_SAFE_WORD) && !isRetry) {
        console.log('Could not answer the question, trying again from scratch');
        delete cache_1.conversationCache[threadID];
        return getChatBotResponse(threadID, mostRecentMessage, convo, true);
    }
    (0, cache_1.appendToConversationCache)(threadID, bot_1.BOT_USER_NAME, reply);
    cache_1.conversationCache[threadID] += reply + '\n\n';
    return reply;
}
exports.getChatBotResponse = getChatBotResponse;
