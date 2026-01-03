const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');
const beautifyBtn = document.getElementById('beautify-btn');
const minifyBtn = document.getElementById('minify-btn');
const escapeBtn = document.getElementById('escape-btn');
const unescapeBtn = document.getElementById('unescape-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');

beautifyBtn.addEventListener('click', () => processJSON(2));
minifyBtn.addEventListener('click', () => processJSON(0));
clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    jsonOutput.innerHTML = '';
});
if (escapeBtn) escapeBtn.addEventListener('click', escapeJSON);
if (unescapeBtn) unescapeBtn.addEventListener('click', unescapeJSON);
copyBtn.addEventListener('click', copyToClipboard);

function processJSON(indent) {
    const raw = jsonInput.value.trim();
    if (!raw) {
        // Don't show error for empty input, just clear output
        jsonOutput.innerHTML = '';
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        // If minifying (indent 0), just set textContent for performance and correct spacing
        if (indent === 0) {
            jsonOutput.textContent = JSON.stringify(parsed, null, 0);
            return;
        }

        // Otherwise syntax highlight
        const formatted = JSON.stringify(parsed, null, indent);
        jsonOutput.innerHTML = syntaxHighlight(formatted);
    } catch (e) {
        jsonOutput.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    }
}

function escapeJSON() {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    try {
        let contentToEscape = raw;
        // If it parses as an object/array, minify it first so we don't escape tons of whitespace
        try {
            const parsed = JSON.parse(raw);
            contentToEscape = JSON.stringify(parsed);
        } catch (e) {
            // Not valid JSON, just escape the raw string
        }

        const escaped = JSON.stringify(contentToEscape);
        jsonOutput.textContent = escaped;
    } catch (e) {
        jsonOutput.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    }
}

function unescapeJSON() {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    try {
        let unescaped;

        if (raw.startsWith('"') && raw.endsWith('"')) {
            unescaped = JSON.parse(raw);
        } else {
            try {
                unescaped = JSON.parse(`"${raw}"`);
            } catch (e) {
                unescaped = JSON.parse(raw); // Fallback
            }
        }

        try {
            const obj = JSON.parse(unescaped);
            jsonOutput.innerHTML = syntaxHighlight(JSON.stringify(obj, null, 2));
        } catch (e) {
            jsonOutput.textContent = unescaped;
        }

    } catch (e) {
        jsonOutput.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    }
}

function syntaxHighlight(json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
    }

    // Replace HTML special characters to prevent HTML injection
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Regex for matching JSON tokens
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

function copyToClipboard() {
    const text = jsonOutput.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function showToast() {
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2000);
}
