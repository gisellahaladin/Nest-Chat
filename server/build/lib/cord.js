"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTypingIndicator = exports.sendMessageToCord = exports.setUserPresence = exports.createOrUpdateCordOrgWithUsers = exports.createOrUpdateCordUser = exports.getCordClientAuthToken = exports.getCordServerAuthToken = exports.USER_NAME = exports.CORD_USER_EMAIL = exports.CORD_SERVER = exports.CORD_API_SECRET = exports.CORD_APPLICATION_ID = void 0;
const dotenv = require("dotenv");
const axios_1 = require("axios");
const server_1 = require("@cord-sdk/server");
const bot_1 = require("./bot");
dotenv.config();
// All api calls to Cord
exports.CORD_APPLICATION_ID = process.env.CORD_APPLICATION_ID;
exports.CORD_API_SECRET = process.env.CORD_API_SECRET;
exports.CORD_SERVER = process.env.CORD_SERVER;
exports.CORD_USER_EMAIL = process.env.CORD_USER_EMAIL;
exports.USER_NAME = 'You';
async function getCordServerAuthToken() {
    return (0, server_1.getServerAuthToken)(exports.CORD_APPLICATION_ID, exports.CORD_API_SECRET);
}
exports.getCordServerAuthToken = getCordServerAuthToken;
async function getCordClientAuthToken(user) {
    return (0, server_1.getClientAuthToken)(exports.CORD_APPLICATION_ID, exports.CORD_API_SECRET, user);
}
exports.getCordClientAuthToken = getCordClientAuthToken;
/**
 * Updates or creates user on the cord side
 * https://docs.cord.com/reference/rest-api/users
 */
async function createOrUpdateCordUser({ userID, userName, profilePictureURL, }) {
    try {
        const token = await getCordServerAuthToken();
        await axios_1.default.put(exports.CORD_SERVER + '/v1/users/' + encodeURIComponent(userID), {
            email: exports.CORD_USER_EMAIL,
            name: userName,
            shortName: userName,
            profilePictureURL,
        }, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });
    }
    catch (error) {
        console.log('createOrUpdateCordUser:', error);
    }
}
exports.createOrUpdateCordUser = createOrUpdateCordUser;
/**
 * Updates or creates org and adds user on the cord side
 * https://docs.cord.com/reference/rest-api/organizations
 */
async function createOrUpdateCordOrgWithUsers({ orgID, userIDs, }) {
    try {
        const token = await getCordServerAuthToken();
        await axios_1.default.put(exports.CORD_SERVER + '/v1/organizations/' + encodeURIComponent(orgID), {
            name: 'Ad hoc org ' + orgID,
            members: userIDs,
        }, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });
    }
    catch (error) {
        console.log('createOrUpdateCordOrgWithUser:', error);
    }
}
exports.createOrUpdateCordOrgWithUsers = createOrUpdateCordOrgWithUsers;
/**
 * Sets a user as present within the location
 * https://docs.cord.com/reference/rest-api/presence
 */
async function setUserPresence(location, orgID, absent, userID) {
    try {
        const token = await getCordServerAuthToken();
        await axios_1.default.put(exports.CORD_SERVER + '/v1/users/' + encodeURIComponent(userID) + '/presence', {
            absent,
            durable: false,
            location,
            organizationID: orgID,
        }, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });
    }
    catch (error) {
        console.log('setUserPresence', error);
    }
}
exports.setUserPresence = setUserPresence;
/**
 * Creates a message on a Cord thread
 * https://docs.cord.com/reference/rest-api/messages
 */
async function sendMessageToCord({ userID, threadID, messageContent, }) {
    try {
        const token = await getCordServerAuthToken();
        const resp = await axios_1.default.post(exports.CORD_SERVER + '/v1/threads/' + encodeURIComponent(threadID) + '/messages', {
            id: 'msg-' + Date.now() + '-' + (userID === bot_1.BOT_USER_ID ? 'bot' : 'user'),
            authorID: userID,
            content: messageContent,
        }, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });
        if (resp.status !== 200) {
            throw new Error('Response not 200');
        }
    }
    catch (error) {
        console.log('setUserPresence', error);
    }
}
exports.sendMessageToCord = sendMessageToCord;
/**
 * Adds users to the typing indicator of a thread
 * https://docs.cord.com/rest-apis/threads
 */
async function updateTypingIndicator(threadID, userIDs, typing) {
    try {
        const token = await getCordServerAuthToken();
        await axios_1.default.put(`${exports.CORD_SERVER}/v1/threads/${encodeURIComponent(threadID)}`, { typing: typing ? userIDs : [] }, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });
    }
    catch (error) {
        console.log('updateTypingIndicator', error);
    }
}
exports.updateTypingIndicator = updateTypingIndicator;
