"use strict";
/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const breakingChars = " \n\r~`!@#$%^&*()-+={}|[]\\:\";'<>?,./";
/**
 * Simple tokenizer that breaks on spaces and punctuation. The only normalization done is to lowercase
 *
 */
function defaultTokenizer(text, locale) {
    const tokens = [];
    let token;
    function appendToken(end) {
        if (token) {
            token.end = end;
            token.normalized = token.text.toLowerCase();
            tokens.push(token);
            token = undefined;
        }
    }
    // Parse text
    const length = text ? text.length : 0;
    let i = 0;
    while (i < length) {
        // Get both the UNICODE value of the current character and the complete character itself
        // which can potentially be multiple segments.
        const codePoint = text.codePointAt(i) || text.charCodeAt(i);
        const chr = String.fromCodePoint(codePoint);
        // Process current character
        if (isBreakingChar(codePoint)) {
            // Character is in Unicode Plane 0 and is in an excluded block
            appendToken(i - 1);
        }
        else if (codePoint > 0xFFFF) {
            // Character is in a Supplementary Unicode Plane. This is where emoji live so
            // we're going to just break each character in this range out as its own token.
            appendToken(i - 1);
            tokens.push({
                start: i,
                end: i + (chr.length - 1),
                text: chr,
                normalized: chr
            });
        }
        else if (!token) {
            // Start a new token
            token = { start: i, text: chr };
        }
        else {
            // Add on to current token
            token.text += chr;
        }
        i += chr.length;
    }
    appendToken(length - 1);
    return tokens;
}
exports.defaultTokenizer = defaultTokenizer;
function isBreakingChar(codePoint) {
    return (isBetween(codePoint, 0x0000, 0x002F) ||
        isBetween(codePoint, 0x003A, 0x0040) ||
        isBetween(codePoint, 0x005B, 0x0060) ||
        isBetween(codePoint, 0x007B, 0x00BF) ||
        isBetween(codePoint, 0x02B9, 0x036F) ||
        isBetween(codePoint, 0x2000, 0x2BFF) ||
        isBetween(codePoint, 0x2E00, 0x2E7F));
}
function isBetween(value, from, to) {
    return (value >= from && value <= to);
}
//# sourceMappingURL=tokenizer.js.map