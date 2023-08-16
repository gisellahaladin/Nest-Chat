"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORD_WEBHOOK_PATH = exports.HOST = exports.PORT = void 0;
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const InitializeChatbotHandler_1 = require("./routes/InitializeChatbotHandler");
const SendFirstMessageHandler_1 = require("./routes/SendFirstMessageHandler");
const CordWebhookEventsHandler_1 = require("./routes/CordWebhookEventsHandler");
const env_1 = require("./scripts/lib/env");
dotenv.config();
exports.PORT = parseInt(process.env.PORT, 10);
exports.HOST = process.env.HOST;
exports.CORD_WEBHOOK_PATH = process.env.CORD_WEBHOOK_PATH;
(0, env_1.checkEnvVars)()
    .then(() => {
    const app = express();
    app.use(express.json({ limit: '100kb' }));
    app.use(cors());
    app.use(express.static('public'));
    // Sets the response headers to routes below
    app.use((_req, res, next) => {
        res.set('Content-Type', 'application/json');
        next();
    });
    app.get('/', (_, res) => {
        res.status(418);
        res.send("API server up and running. Bet you can't catch me!");
    });
    // Returns the clientAuthToken to set this on the Cord provider on the client side
    app.post('/initialize-chatbot', InitializeChatbotHandler_1.default);
    // The bot will send the first message to the user if there are no messages.
    app.post('/send-first-message', SendFirstMessageHandler_1.default);
    // All the cord web events get sent to here
    app.post(exports.CORD_WEBHOOK_PATH, CordWebhookEventsHandler_1.default);
    app.listen(exports.PORT, () => {
        console.log('--- Server started ---' +
            '\n' +
            `Cord AI Chatbot App listening on ${exports.HOST}:${exports.PORT}`);
    });
})
    .catch((error) => {
    console.log('--- Server did not start ---' + '\n' + error.message);
    process.exit();
});
