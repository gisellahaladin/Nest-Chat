"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOwnProperty = void 0;
// This function determines if X has property Y and does so in a
// a way that preserves the type information within TypeScript.
function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
exports.hasOwnProperty = hasOwnProperty;
