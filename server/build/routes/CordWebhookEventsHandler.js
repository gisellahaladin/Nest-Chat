"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonStableStringify = require("fast-json-stable-stringify");
const crypto_1 = require("crypto");
const openai_1 = require("./../lib/openai");
const bot_1 = require("../lib/bot");
const cache_1 = require("../lib/cache");
const cord_1 = require("../lib/cord");
const messageContent_1 = require("../lib/messageContent");
/**
 * https://docs.cord.com/reference/events-webhook
 */
async function CordWebhookEventsHandler(req, res) {
    res.status(200);
    res.send();
    console.log('--- Cord Webhook Firing ---');
    verifySignature(req);
    // For all types refer to https://docs.cord.com/reference/events-webhook
    const type = req.body.type;
    if (!type) {
        console.log('No type found, ignoring');
        return;
    }
    if (type !== 'thread-message-added') {
        console.log('Event is not thread-message-added type');
        return;
    }
    const { message, thread } = req.body.event;
    if (message.id.endsWith('-bot')) {
        console.log('Ignoring the message from the bot');
        return;
    }
    const clearBotTypingInterval = await (0, bot_1.showBotIsTyping)(thread.id);
    const clearBotPresence = await (0, bot_1.showBotIsPresent)(bot_1.BOT_PRESENCE_LOCATION, thread.organizationID);
    const plainText = (0, messageContent_1.convertCordMessageToPlainText)(message.content);
    if (!(thread.id in cache_1.conversationCache)) {
        (0, cache_1.initializeConversationWithPrompt)(thread.id);
    }
    (0, cache_1.appendToConversationCache)(thread.id, cord_1.USER_NAME, plainText);
    const botResponse = await (0, openai_1.getChatBotResponse)(thread.id, plainText, cache_1.conversationCache[thread.id]);
    await clearBotTypingInterval();
    (0, cache_1.appendToConversationCache)(thread.id, bot_1.BOT_USER_NAME, botResponse);
    await (0, cord_1.sendMessageToCord)({
        userID: bot_1.BOT_USER_ID,
        threadID: thread.id,
        messageContent: [(0, messageContent_1.generateCordParagraph)(botResponse)],
    });
    await clearBotPresence();
}
exports.default = CordWebhookEventsHandler;
function verifySignature(req) {
    const cordTimestamp = req.header('X-Cord-Timestamp');
    const cordSignature = req.header('X-Cord-Signature');
    const bodyString = jsonStableStringify(req.body);
    const verifyStr = cordTimestamp + ':' + bodyString;
    const hmac = (0, crypto_1.createHmac)('sha256', cord_1.CORD_API_SECRET);
    hmac.update(verifyStr);
    const mySignature = hmac.digest('base64');
    if (cordSignature !== mySignature) {
        throw new Error('Signatures do not match');
    }
}
