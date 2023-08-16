"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showBotIsPresent = exports.showBotIsTyping = exports.BOT_PRESENCE_LOCATION = exports.CONTENT_START = exports.BOT_CONTEXT = exports.BOT_FIRST_MESSAGE = exports.BOT_SAFE_WORD = exports.BOT_USER_ID = exports.BOT_USER_NAME = void 0;
const cord_1 = require("./cord");
// Customise these
exports.BOT_USER_NAME = 'Eggy';
exports.BOT_USER_ID = 'Cord-Blimey-2';
exports.BOT_SAFE_WORD = "Well, you've got me stumped!";
exports.BOT_FIRST_MESSAGE = `Hi! I'm ${exports.BOT_USER_NAME}. How may I help?`;
exports.BOT_CONTEXT = 'BOT_CONTEXT';
exports.CONTENT_START = '\n!*_~*~_*!\n';
/**
 * https://docs.cord.com/reference/location
 */
exports.BOT_PRESENCE_LOCATION = { page: 'cord-ai-chatbot' };
async function showBotIsTyping(threadID) {
    // We leave some time before they see the typing indicator
    setTimeout(() => (0, cord_1.updateTypingIndicator)(threadID, [exports.BOT_USER_ID], true), 1000);
    // Want to constantly show the typing indicator
    const interval = setInterval(() => (0, cord_1.updateTypingIndicator)(threadID, [exports.BOT_USER_ID], true), 2500);
    function stopBotTyping() {
        clearInterval(interval);
        (0, cord_1.updateTypingIndicator)(threadID, [exports.BOT_USER_ID], false);
    }
    return stopBotTyping;
}
exports.showBotIsTyping = showBotIsTyping;
async function showBotIsPresent(location, orgID) {
    // Initially make the bot appear
    (0, cord_1.setUserPresence)(location, orgID, false, exports.BOT_USER_ID);
    // Ephemeral presence lasts for 30 seconds so we set an interval incase
    // the chat bot takes longer
    const botPresenceInterval = setInterval(() => {
        (0, cord_1.setUserPresence)(location, orgID, false, exports.BOT_USER_ID);
    }, 25 * 1000);
    function removeBotPresence() {
        clearInterval(botPresenceInterval);
        // Want to give it a second before it dissappears
        setTimeout(async () => {
            await (0, cord_1.setUserPresence)(location, orgID, true, exports.BOT_USER_ID);
        }, 1000);
    }
    return removeBotPresence;
}
exports.showBotIsPresent = showBotIsPresent;
