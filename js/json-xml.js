// json-xml.js — JSON to XML Converter

// ── DOM refs ──────────────────────────────────────────────
const jsonInput = document.getElementById('json-input');
const xmlOutput = document.getElementById('xml-output');
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

// ── XML conversion helpers ─────────────────────────────────
function sanitizeTag(name) {
    name = name.toString().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    if (/^[0-9\-\.]/.test(name)) name = '_' + name;
    return name;
}

function escapeXmlValue(val) {
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function jsonToXml(obj, tagName) {
    tagName = sanitizeTag(tagName || 'root');

    if (obj === null) return `<${tagName}></${tagName}>`;

    if (typeof obj !== 'object') {
        return `<${tagName}>${escapeXmlValue(obj)}</${tagName}>`;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => jsonToXml(item, tagName)).join('\n');
    }

    const children = Object.entries(obj)
        .map(([key, val]) => {
            if (Array.isArray(val)) {
                return val.map(item => jsonToXml(item, key)).join('\n');
            }
            return jsonToXml(val, key);
        })
        .join('\n');

    return `<${tagName}>\n${children}\n</${tagName}>`;
}

function indentXml(xml) {
    let indent = 0;
    return xml.split('\n').map(line => {
        line = line.trim();
        if (!line) return '';
        if (line.startsWith('</')) indent = Math.max(0, indent - 1);
        const result = '  '.repeat(indent) + line;
        if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>') && !line.startsWith('<?')) {
            const tag = line.match(/^<([a-zA-Z0-9_\-\.]+)/);
            if (tag && !line.includes(`</${tag[1]}>`)) indent++;
        }
        return result;
    }).filter(l => l !== '').join('\n');
}

// ── Convert ────────────────────────────────────────────────
function convertToXml() {
    const input = jsonInput.value.trim();
    if (!input) {
        xmlOutput.textContent = 'Please enter JSON to convert.';
        xmlOutput.classList.add('error');
        updateLineNumbers(xmlOutput, outputLineNumbers);
        return;
    }

    let parsed;
    try {
        parsed = JSON.parse(input);
    } catch (e) {
        xmlOutput.innerHTML = `<span class="error">Invalid JSON: ${e.message}</span>`;
        updateLineNumbers(xmlOutput, outputLineNumbers);
        return;
    }

    try {
        const raw = `<?xml version="1.0" encoding="UTF-8"?>\n` + jsonToXml(parsed, 'root');
        xmlOutput.textContent = indentXml(raw);
        updateLineNumbers(xmlOutput, outputLineNumbers);
    } catch (e) {
        xmlOutput.innerHTML = `<span class="error">Conversion failed: ${e.message}</span>`;
        updateLineNumbers(xmlOutput, outputLineNumbers);
    }
}

// ── Event listeners ────────────────────────────────────────
convertBtn.addEventListener('click', convertToXml);

clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    xmlOutput.textContent = '';
    updateLineNumbers(jsonInput, inputLineNumbers);
    updateLineNumbers(xmlOutput, outputLineNumbers);
});

copyBtn.addEventListener('click', () => {
    const text = xmlOutput.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
    });
});

// Input typing → update input line numbers
jsonInput.addEventListener('input', () => {
    updateLineNumbers(jsonInput, inputLineNumbers);
});

// Scroll sync
jsonInput.addEventListener('scroll', () => {
    inputLineNumbers.scrollTop = jsonInput.scrollTop;
});
xmlOutput.addEventListener('scroll', () => {
    outputLineNumbers.scrollTop = xmlOutput.scrollTop;
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

// Init line numbers for empty state
updateLineNumbers(jsonInput, inputLineNumbers);
