"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const env_1 = require("./lib/env");
dotenv.config();
// This script generates a default .env file in the server folder.
// Variables that need to be inserted are the openAI credentials, and an
// email for the user to received cord notifications
const main = async () => {
    // Check if there is an existing one
    await (0, env_1.generateDotEnv)();
};
main().catch((err) => {
    console.error('Somthing went wrong with generating .env', err);
    process.exit(1);
});
