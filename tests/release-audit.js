'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];
const quote = String.fromCharCode(34);
const attributeQuotes = quote + String.fromCharCode(39);

function walk(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const absolutePath = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
    });
}

function relative(file) {
    return path.relative(root, file).split(path.sep).join('/');
}

function report(level, file, message) {
    (level === 'error' ? errors : warnings).push({ file, message });
}

function hasBalancedCssBraces(source) {
    let braces = 0;
    let quoteCharacter = '';
    let comment = false;

    for (let index = 0; index < source.length; index += 1) {
        const character = source[index];
        const next = source[index + 1];

        if (comment) {
            if (character === '*' && next === '/') {
                comment = false;
                index += 1;
            }
            continue;
        }

        if (!quoteCharacter && character === '/' && next === '*') {
            comment = true;
            index += 1;
            continue;
        }

        if (quoteCharacter) {
            if (character === '\\') {
                index += 1;
            } else if (character === quoteCharacter) {
                quoteCharacter = '';
            }
            continue;
        }

        if ([quote, String.fromCharCode(39), String.fromCharCode(96)].includes(character)) {
            quoteCharacter = character;
        } else if (character === '{') {
            braces += 1;
        } else if (character === '}') {
            braces -= 1;
        }

        if (braces < 0) {
            return false;
        }
    }

    return braces === 0 && !comment && !quoteCharacter;
}

function isExternalReference(reference) {
    return /^(https?:|\/\/|#|mailto:|tel:|data:|javascript:)/i.test(reference);
}

const files = walk(root);
const exactFiles = new Set(files.map(relative));

files.filter(file => file.endsWith('.css')).forEach(file => {
    if (!hasBalancedCssBraces(fs.readFileSync(file, 'utf8'))) {
        report('error', relative(file), 'CSS braces or quoted content are unbalanced.');
    }
});

files.filter(file => file.endsWith('.html')).forEach(file => {
    const fileName = relative(file);
    const source = fs.readFileSync(file, 'utf8');
    const ids = new Set();
    const idPattern = new RegExp('\\bid\\s*=\\s*([' + attributeQuotes + '])([^' + attributeQuotes + ']*)\\1', 'g');
    const referencePattern = new RegExp('\\b(?:src|href)\\s*=\\s*([' + attributeQuotes + '])([^' + attributeQuotes + ']*)\\1', 'g');
    const fieldPattern = /<(input|select|textarea)\b([^>]*)>/gi;
    const buttonPattern = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
    let match;

    const standaloneDocument = /<html\b/i.test(source);

    if (standaloneDocument && !/<html\b[^>]*\blang\s*=/i.test(source)) {
        report('error', fileName, 'Document language is missing.');
    }

    const viewportPattern = new RegExp('<meta\\b[^>]*\\bname\\s*=\\s*[' + attributeQuotes + ']viewport[' + attributeQuotes + ']', 'i');
    if (standaloneDocument && !viewportPattern.test(source)) {
        report('error', fileName, 'Viewport metadata is missing.');
    }

    while ((match = idPattern.exec(source))) {
        if (ids.has(match[2])) {
            report('error', fileName, 'Duplicate id: ' + match[2]);
        }
        ids.add(match[2]);
    }

    while ((match = referencePattern.exec(source))) {
        const reference = match[2].split('#')[0].split('?')[0];

        if (!reference || isExternalReference(reference)) {
            continue;
        }

        const target = relative(path.resolve(path.dirname(file), reference));

        if (!exactFiles.has(target)) {
            report('error', fileName, 'Broken local reference: ' + match[2]);
            continue;
        }

        if (target.endsWith('.html') && fs.readFileSync(path.join(root, target), 'utf8').trim() === '') {
            report('error', fileName, 'Linked page is empty: ' + match[2]);
        }
    }

    while ((match = buttonPattern.exec(source))) {
        const attributes = match[1];
        const text = match[2].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        const hasAccessibleName = /\baria-label\s*=|\baria-labelledby\s*=|\btitle\s*=/.test(attributes);

        if (!text && !hasAccessibleName) {
            report('error', fileName, 'Icon-only button lacks an accessible name.');
        }
    }

    while ((match = fieldPattern.exec(source))) {
        const attributes = match[2];
        const fieldIdMatch = new RegExp('\\bid\\s*=\\s*[' + attributeQuotes + ']([^' + attributeQuotes + ']*)[' + attributeQuotes + ']').exec(attributes);
        const typeMatch = new RegExp('\\btype\\s*=\\s*[' + attributeQuotes + ']([^' + attributeQuotes + ']*)[' + attributeQuotes + ']').exec(attributes);
        const type = String(typeMatch?.[1] || '').toLowerCase();

        if (!fieldIdMatch || ['hidden', 'button', 'submit', 'reset'].includes(type)) {
            continue;
        }

        const id = fieldIdMatch[1];
        const labelPattern = new RegExp('<label\\b[^>]*\\bfor\\s*=\\s*[' + attributeQuotes + ']' + id + '[' + attributeQuotes + ']', 'i');
        const hasAccessibleName = labelPattern.test(source) ||
            /\baria-label\s*=|\baria-labelledby\s*=/.test(attributes);

        if (!hasAccessibleName) {
            report('error', fileName, 'Form control lacks an accessible name: ' + id);
        }
    }
});

process.stdout.write(JSON.stringify({
    filesReviewed: files.length,
    errors,
    warnings
}, null, 2) + '\n');

process.exitCode = errors.length > 0 ? 1 : 0;
