"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cord_1 = require("./../lib/cord");
const bot_1 = require("../lib/bot");
const messageContent_1 = require("../lib/messageContent");
const cache_1 = require("../lib/cache");
async function SendFirstMessageHandler(req, res) {
    const threadID = req.body.threadID;
    try {
        await (0, cord_1.sendMessageToCord)({
            threadID,
            userID: bot_1.BOT_USER_ID,
            messageContent: [(0, messageContent_1.generateCordParagraph)(bot_1.BOT_FIRST_MESSAGE)],
        });
        res.status(200).send();
        // Want to show the bot as not present after it sends a message
        setTimeout(() => {
            (0, cord_1.setUserPresence)(bot_1.BOT_PRESENCE_LOCATION, cache_1.threadOrgCache[threadID], true, bot_1.BOT_USER_ID);
        }, 1000);
        return;
    }
    catch (e) {
        console.log('SendFirstMessageHandler', e);
        return res.status(401).send();
    }
}
exports.default = SendFirstMessageHandler;
