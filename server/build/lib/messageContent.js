"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCordMessageToPlainText = exports.generateCordParagraph = void 0;
function generateCordParagraph(msg) {
    return {
        type: 'p',
        children: [
            {
                text: msg,
            },
        ],
    };
}
exports.generateCordParagraph = generateCordParagraph;
function convertCordMessageToPlainText(content) {
    const txtParts = [];
    messageToPlainText(content, txtParts);
    return txtParts.join('');
}
exports.convertCordMessageToPlainText = convertCordMessageToPlainText;
function messageToPlainText(msg, text) {
    for (const part of msg) {
        if (hasOwnProperty(part, 'text') && typeof part.text === 'string') {
            text.push(part.text);
        }
        if (hasOwnProperty(part, 'children') && Array.isArray(part.children)) {
            messageToPlainText(part.children, text);
        }
    }
}
// This function determines if X has property Y and does so in a
// a way that preserves the type information within TypeScript.
function hasOwnProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}
