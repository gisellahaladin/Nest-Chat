"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse5_1 = require("parse5");
const hasOwnProperty_1 = require("./hasOwnProperty");
// Set this data attribute to anything truthy in your HTML to have the scraping
// code ignore it completely.
const DATA_SEARCH_IGNORE = 'data-search-ignore';
function assertIsAttrList(thing) {
    if (Array.isArray(thing)) {
        return thing;
    }
    throw new Error('Malformed attribute list');
}
// This value is extremely arbitrary. I don't really know enough about LLM
// to know if many small chunks are better or if we'd do better with more
// larger ones. This is something worth playing with if we don't feel we're
// getting useful search results. In my limiting playing with it, smaller
// chunks seemed to perform worse than larger ones. So, this value is set
// to push us near the upper limit for the number of tokens that go into
// an embedding.
const MAX_PART_LENGTH = 10000;
function appendTextNodes(data, nodeList, currentHeadingLevel = 0, isPreformatted = false) {
    outer: for (const node of nodeList) {
        if (node.nodeName === 'iframe' ||
            node.nodeName === 'script' ||
            node.nodeName === 'noscript' ||
            node.nodeName === 'style') {
            continue;
        }
        // Try to be a bit smart about chunking together things that are under the
        // same heading. So, if we encounter an H1 and then an H2, as long as we
        // have space left in the chunk size, we'll keep appending them into the
        // same chunk. However, if we've been putting together the content under an
        // H1 tag and we encounter another H1, we'll pinch off the chunk we've been
        // working on because the page structure indicates we've got a new topic.
        //
        // This works pretty well for pages that have good semantic HTML in the
        // headings. If the pages have poor semantics in the headings, this is a
        // dice roll. Garbage in, garbage out. In practice, that will still be okay
        // because chunks + cosine similarity are surprisingly good at finding the
        // right needles even when the haystack is hot garbage.
        let headingLevel = 0;
        const match = node.nodeName.match(/^h(\d)$/i);
        if (match) {
            headingLevel = parseInt(match[1], 10);
            if (headingLevel < currentHeadingLevel) {
                data.finalOutput.push(data.currentParts.join('').trim());
                data.currentParts = [];
                data.currentPartsLength = 0;
            }
            currentHeadingLevel = headingLevel;
        }
        if (node.nodeName === '#text') {
            const v = node.value + (isPreformatted ? '' : ' ');
            // If the chunk is getting too big, we'll pinch it off here and
            // reset the counter.
            if (data.currentPartsLength + v.length > MAX_PART_LENGTH) {
                data.finalOutput.push(data.currentParts.join('').trim());
                data.currentParts = [v];
                data.currentPartsLength = v.length;
                // Otherwise, just keep tacking the text value onto the current part
            }
            else {
                data.currentParts.push(v);
                data.currentPartsLength += v.length;
            }
        }
        else {
            if ((0, hasOwnProperty_1.hasOwnProperty)(node, 'attrs')) {
                const attrList = assertIsAttrList(node.attrs);
                for (const attr of attrList) {
                    if (attr.name === DATA_SEARCH_IGNORE) {
                        continue outer;
                    }
                }
            }
            if ((0, hasOwnProperty_1.hasOwnProperty)(node, 'childNodes') &&
                Array.isArray(node.childNodes)) {
                // If we encounter preformatted text, we'll make sure to separate it
                // from its preceding content.
                const newPreTag = node.nodeName === 'pre';
                if (newPreTag) {
                    data.currentParts.push('\n```\n');
                    data.currentPartsLength += 5;
                }
                appendTextNodes(data, node.childNodes, currentHeadingLevel, isPreformatted || newPreTag);
                if (newPreTag) {
                    data.currentParts.push('\n```\n');
                    data.currentPartsLength += 5;
                }
            }
        }
        if (headingLevel) {
            data.currentParts.push('\n\n');
            data.currentPartsLength += 2;
        }
    }
}
function getBody(childNodes) {
    for (const child of childNodes) {
        if (child.nodeName === 'body') {
            return child;
        }
        else if ((0, hasOwnProperty_1.hasOwnProperty)(child, 'childNodes') &&
            Array.isArray(child.childNodes)) {
            const body = getBody(child.childNodes);
            if (body) {
                return body;
            }
        }
    }
    return undefined;
}
function parseDownToPlaintextStrings(page) {
    const root = (0, parse5_1.parse)(page);
    const body = getBody(root.childNodes);
    if (!body ||
        !(0, hasOwnProperty_1.hasOwnProperty)(body, 'childNodes') ||
        !Array.isArray(body.childNodes)) {
        return [];
    }
    const data = {
        finalOutput: [],
        currentParts: [],
        currentPartsLength: 0,
    };
    appendTextNodes(data, body.childNodes);
    if (data.currentParts.length) {
        data.finalOutput.push(data.currentParts.join(' ').trim());
    }
    // Any chunks that are empty strings or just newlines, tabs, and spaces --
    // nuke them.
    data.finalOutput = data.finalOutput
        .map((str) => str.replace(/\n[ ]+/g, '\n').replace(/\n\n+/g, '\n\n'))
        .filter((str) => !str.match(/^\s+$/))
        .filter(Boolean);
    return data.finalOutput;
}
exports.default = parseDownToPlaintextStrings;
