"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const bot_1 = require("../lib/bot");
const cord_1 = require("../lib/cord");
const server_1 = require("../server");
const cache_1 = require("../lib/cache");
async function InitializeChatbotHandler(req, res) {
    const userID = (0, uuid_1.v4)();
    const orgID = (0, uuid_1.v4)();
    const threadID = req.body.threadID;
    await (0, cord_1.createOrUpdateCordUser)({
        userID,
        userName: cord_1.USER_NAME,
        profilePictureURL: `${server_1.HOST}:${server_1.PORT}/user-avatar.png`,
    });
    await (0, cord_1.createOrUpdateCordUser)({
        userID: bot_1.BOT_USER_ID,
        userName: bot_1.BOT_USER_NAME,
        profilePictureURL: `${server_1.HOST}:${server_1.PORT}/cordy-avatar.png`,
    });
    await (0, cord_1.createOrUpdateCordOrgWithUsers)({
        userIDs: [userID, bot_1.BOT_USER_ID],
        orgID,
    });
    // Want to show the bot as present before it sends a message
    await (0, cord_1.setUserPresence)(bot_1.BOT_PRESENCE_LOCATION, orgID, false, bot_1.BOT_USER_ID);
    // Store threadID and orgID realation
    cache_1.threadOrgCache[threadID] = orgID;
    const user = {
        user_id: userID,
        organization_id: orgID,
    };
    const clientAuthToken = await (0, cord_1.getCordClientAuthToken)(user);
    res.status(200);
    res.send(JSON.stringify({ clientAuthToken }));
}
exports.default = InitializeChatbotHandler;
