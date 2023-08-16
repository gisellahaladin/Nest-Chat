"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnvVars = exports.generateDotEnv = exports.defaultEnvValues = void 0;
const dotenv = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
exports.defaultEnvValues = {
    HOST: 'http://localhost',
    PORT: 4000,
    CORD_SERVER: 'https://api.cord.com',
    CORD_APPLICATION_ID: '<INSERT A CORD APPLICATION ID>',
    CORD_API_SECRET: '<INSERT THE CORD API SECRET ASSOCIATED WITH APPLICATION ID>',
    CORD_USER_EMAIL: '<INSERT AN EMAIL ADDRESS FOR USER NOTIFICATIONS>',
    OPENAI_API_SECRET: '<INSERT YOUR OPEN API SECRET>',
    OPENAI_API_MODEL: 'gpt-3.5-turbo',
    CORD_WEBHOOK_PATH: '/cord-webhook',
};
const CORD_CREDENTIALS_MESSAGE = '--- Cord Credentials ---' +
    '\n' +
    'This can be found in the Cord Console https://console.cord.com.' +
    '\n' +
    'If you do not have an account you can sign up here: https://console.cord.com/signup.' +
    '\n\n';
const OPENAI_CREDENTIALS_MESSAGE = '--- OpenAI Credentials ---' +
    '\n' +
    'This can be found once you have signed up to OpenAI https://platform.openai.com/account/api-keys.' +
    '\n\n';
const ENV_KEYS = Object.keys(exports.defaultEnvValues);
function generateDotEnv() {
    const envFile = (0, fs_1.existsSync)((0, path_1.join)(process.cwd(), '.env'));
    if (!envFile) {
        console.log('--- Creating .env with default values ---' + '\n\n');
        (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), '.env'), ENV_KEYS.map((envVar) => generateEnvRow(envVar)).join(''));
        console.log('Please fill in the missing env variables in .env' +
            '\n\n' +
            CORD_CREDENTIALS_MESSAGE +
            OPENAI_CREDENTIALS_MESSAGE);
        return;
    }
    const result = dotenv.config().parsed;
    checkForMissingVariables(result);
}
exports.generateDotEnv = generateDotEnv;
async function checkEnvVars() {
    console.log('--- Checking Env ---' + '\n\n');
    const envFile = (0, fs_1.existsSync)((0, path_1.join)(process.cwd(), '.env'));
    if (!envFile) {
        generateDotEnv();
    }
    const result = dotenv.config().parsed;
    checkForMissingVariables(result, () => {
        throw new Error('Fill in missing variables.');
    });
    // Check if credentials are default values
    if (result &&
        result['CORD_APPLICATION_ID'] === exports.defaultEnvValues['CORD_APPLICATION_ID']) {
        throw new Error('Update Cord application id');
    }
    if (result &&
        result['CORD_API_SECRET'] === exports.defaultEnvValues['CORD_API_SECRET']) {
        throw new Error('Update Cord application api secret');
    }
    if (result &&
        result['OPENAI_API_SECRET'] === exports.defaultEnvValues['OPENAI_API_SECRET']) {
        throw new Error('Update openAI api secret');
    }
    if (result &&
        result['CORD_USER_EMAIL'] === exports.defaultEnvValues['CORD_USER_EMAIL']) {
        throw new Error('Update Cord user email');
    }
}
exports.checkEnvVars = checkEnvVars;
function populateEnvWithSomeDefaultVars(missingEnvVars) {
    const writeData = [];
    missingEnvVars.forEach((missingVar) => writeData.push(generateEnvRow(missingVar)));
    (0, fs_1.appendFileSync)((0, path_1.join)(process.cwd(), '.env'), '\n' + writeData.join(''));
}
function generateEnvRow(envVar) {
    return envVar + '=' + `'${exports.defaultEnvValues[envVar]}'` + '\n';
}
function checkForMissingVariables(env, onMissingVariables) {
    const missingEnvVars = new Set();
    ENV_KEYS.forEach((variableName) => {
        if (!env || !env[variableName]) {
            missingEnvVars.add(variableName);
        }
    });
    if (missingEnvVars.size > 0) {
        console.log('--- Missing environment variables ---' +
            '\n' +
            `${Array.from(missingEnvVars).join(', ')}` +
            '\n\n');
        populateEnvWithSomeDefaultVars(Array.from(missingEnvVars));
        console.log(`${missingEnvVars.has('CORD_APPLICATION_ID') ||
            missingEnvVars.has('CORD_API_SECRET')
            ? CORD_CREDENTIALS_MESSAGE + '\n\n'
            : ''}` +
            `${missingEnvVars.has('OPENAI_API_SECRET')
                ? OPENAI_CREDENTIALS_MESSAGE + '\n\n'
                : ''}`);
        onMissingVariables?.(missingEnvVars);
        return;
    }
    console.log('--- No environment variables missing ---' + '\n\n');
}
