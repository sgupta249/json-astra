// xml-json.js — XML to JSON Converter

// ── DOM refs ──────────────────────────────────────────────
const xmlInput = document.getElementById('xml-input');
const jsonOutput = document.getElementById('json-output');
const convertBtn = document.getElementById('convert-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const inputLineNumbers = document.getElementById('input-line-numbers');
const outputLineNumbers = document.getElementById('output-line-numbers');

// ── Line number helper (mirrors script.js exactly) ─────────
function updateLineNumbers(element, lineNumbersEle) {
    if (!lineNumbersEle || !element) return;
    const val = element.value !== undefined ? element.value : element.textContent;
    const lines = val.split(/\r\n|\r|\n/).length;
    if (lineNumbersEle.childElementCount === lines && lines > 0) return;
    lineNumbersEle.innerHTML = Array(lines)
        .fill(0)
        .map((_, i) => `<div>${i + 1}</div>`)
        .join('');
}

// ── XML → JSON helpers ─────────────────────────────────────
function parseXmlToObj(node) {
    // Text / CDATA node
    if (node.nodeType === 3 || node.nodeType === 4) {
        return node.nodeValue;
    }

    const obj = {};

    // Attributes
    if (node.attributes && node.attributes.length > 0) {
        obj['@attributes'] = {};
        for (const attr of node.attributes) {
            obj['@attributes'][attr.name] = attr.value;
        }
    }

    // Children
    const children = Array.from(node.childNodes || []);
    const elementChildren = children.filter(n => n.nodeType === 1);
    const textChildren = children.filter(n => n.nodeType === 3 || n.nodeType === 4);

    if (elementChildren.length === 0) {
        // Leaf node — just return text
        const text = textChildren.map(t => t.nodeValue).join('').trim();
        if (Object.keys(obj).length === 0) return text === '' ? null : coerceValue(text);
        obj['#text'] = text === '' ? null : coerceValue(text);
        return obj;
    }

    for (const child of elementChildren) {
        const childKey = child.nodeName;
        const childVal = parseXmlToObj(child);
        if (obj[childKey] === undefined) {
            obj[childKey] = childVal;
        } else if (Array.isArray(obj[childKey])) {
            obj[childKey].push(childVal);
        } else {
            obj[childKey] = [obj[childKey], childVal];
        }
    }

    return obj;
}

function coerceValue(str) {
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    if (str !== '' && !isNaN(Number(str))) return Number(str);
    return str;
}

// ── Convert ────────────────────────────────────────────────
function convertToJson() {
    const input = xmlInput.value.trim();
    if (!input) {
        jsonOutput.innerHTML = `<span class="error">Please enter XML to convert.</span>`;
        updateLineNumbers(jsonOutput, outputLineNumbers);
        return;
    }

    let doc;
    try {
        const parser = new DOMParser();
        doc = parser.parseFromString(input, 'application/xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            throw new Error(parseError.textContent.split('\n')[0]);
        }
    } catch (e) {
        jsonOutput.innerHTML = `<span class="error">Invalid XML: ${e.message}</span>`;
        updateLineNumbers(jsonOutput, outputLineNumbers);
        return;
    }

    try {
        const root = doc.documentElement;
        const result = {};
        result[root.nodeName] = parseXmlToObj(root);
        jsonOutput.textContent = JSON.stringify(result, null, 2);
        updateLineNumbers(jsonOutput, outputLineNumbers);
    } catch (e) {
        jsonOutput.innerHTML = `<span class="error">Conversion failed: ${e.message}</span>`;
        updateLineNumbers(jsonOutput, outputLineNumbers);
    }
}

// ── Event listeners ────────────────────────────────────────
convertBtn.addEventListener('click', convertToJson);

clearBtn.addEventListener('click', () => {
    xmlInput.value = '';
    jsonOutput.textContent = '';
    updateLineNumbers(xmlInput, inputLineNumbers);
    updateLineNumbers(jsonOutput, outputLineNumbers);
});

copyBtn.addEventListener('click', () => {
    const text = jsonOutput.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
    });
});

xmlInput.addEventListener('input', () => {
    updateLineNumbers(xmlInput, inputLineNumbers);
});

// Scroll sync
xmlInput.addEventListener('scroll', () => {
    inputLineNumbers.scrollTop = xmlInput.scrollTop;
});
jsonOutput.addEventListener('scroll', () => {
    outputLineNumbers.scrollTop = jsonOutput.scrollTop;
});

// Dropdown nav
document.querySelectorAll('.dropbtn').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const group = btn.closest('.nav-group');
        const isOpen = group.classList.contains('open');
        document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('open'));
        if (!isOpen) group.classList.add('open');
    });
});
document.addEventListener('click', () => {
    document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('open'));
});

// Init
updateLineNumbers(xmlInput, inputLineNumbers);
