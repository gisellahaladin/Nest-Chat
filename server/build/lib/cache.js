"use strict";
// This would be equivalent to your database
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeConversationWithPrompt = exports.appendToConversationCache = exports.threadOrgCache = exports.conversationCache = void 0;
const fs_1 = require("fs");
const bot_1 = require("./bot");
// These caches are pretty limited, but work okay. In a real-world context,
// you'd probably want to replace this with something a bit more robust like a
// Redis caching layer or something similar. These caches make it easy to
// reassemble the messages in the conversation when requesting the next
// completion from the LLM.
exports.conversationCache = {};
exports.threadOrgCache = {};
function appendToConversationCache(threadID, userName, message) {
    exports.conversationCache[threadID] += userName + ': ' + message + '\n\n';
}
exports.appendToConversationCache = appendToConversationCache;
function initializeConversationWithPrompt(threadID) {
    let content = (0, fs_1.readFileSync)(process.cwd() + '/botKnowledge/prompt.txt', {
        encoding: 'utf-8',
        flag: 'r',
    });
    content = content.replace(/BOT_USER_NAME/g, bot_1.BOT_USER_NAME);
    content = content.replace(/BOT_ESCAPE_WORD/g, bot_1.BOT_SAFE_WORD);
    content += bot_1.CONTENT_START;
    exports.conversationCache[threadID] = content;
}
exports.initializeConversationWithPrompt = initializeConversationWithPrompt;
