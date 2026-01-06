const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');
const beautifyBtn = document.getElementById('beautify-btn');
const minifyBtn = document.getElementById('minify-btn');
const escapeBtn = document.getElementById('escape-btn');
const unescapeBtn = document.getElementById('unescape-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const inputLineNumbers = document.getElementById('input-line-numbers');
const outputLineNumbers = document.getElementById('output-line-numbers');

// Update active state visual
function updateActiveButton(clickedBtn) {
    const buttons = [beautifyBtn, minifyBtn, escapeBtn, unescapeBtn];
    buttons.forEach(btn => {
        if (btn) {
            btn.classList.remove('primary-btn');
            btn.classList.add('secondary-btn');
        }
    });
    if (clickedBtn) {
        clickedBtn.classList.remove('secondary-btn');
        clickedBtn.classList.add('primary-btn');
    }
}

beautifyBtn.addEventListener('click', () => {
    updateActiveButton(beautifyBtn);
    processJSON(2);
});

minifyBtn.addEventListener('click', () => {
    updateActiveButton(minifyBtn);
    processJSON(0);
});

clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    jsonOutput.innerHTML = '';
    updateLineNumbers(jsonInput, inputLineNumbers);
    updateLineNumbers(jsonOutput, outputLineNumbers);
});

if (escapeBtn) {
    escapeBtn.addEventListener('click', () => {
        updateActiveButton(escapeBtn);
        escapeJSON();
    });
}

if (unescapeBtn) {
    unescapeBtn.addEventListener('click', () => {
        updateActiveButton(unescapeBtn);
        unescapeJSON();
    });
}
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
    updateLineNumbers(jsonOutput, outputLineNumbers);
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
    updateLineNumbers(jsonOutput, outputLineNumbers);
}

function unescapeJSON() {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    try {
        let unescaped;
        let isDirectlyParsed = false;
        let parsedDirectly;

        try {
            parsedDirectly = JSON.parse(raw);
            isDirectlyParsed = true;
        } catch (e) {
            // Ignore syntax error, it might be an implicit string (e.g. inner content without quotes)
        }

        if (isDirectlyParsed) {
            if (typeof parsedDirectly !== 'string') {
                jsonOutput.innerHTML = `<span class="error">Error: Input is already valid JSON (not escaped).</span>`;
                return;
            }
            unescaped = parsedDirectly;
        } else {
            // Try fallback wrapping in quotes if strict parse failed
            try {
                unescaped = JSON.parse(`"${raw}"`);
            } catch (e) {
                // If even wrapping fails, it's invalid
                throw new Error("Invalid JSON string");
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
    updateLineNumbers(jsonOutput, outputLineNumbers);
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


function updateLineNumbers(element, lineNumbersEle) {
    if (!lineNumbersEle || !element) return;

    // For textarea use value, for div use textContent
    const val = element.value !== undefined ? element.value : element.textContent;
    const lines = val.split(/\r\n|\r|\n/).length;

    // Check if line count changed to avoid unnecessary DOM updates
    if (lineNumbersEle.childElementCount === lines && lines > 0) return;

    lineNumbersEle.innerHTML = Array(lines)
        .fill(0)
        .map((_, i) => `<div>${i + 1}</div>`)
        .join('');
}

// Initial setup for line numbers
if (jsonInput && inputLineNumbers) {
    jsonInput.addEventListener('input', () => {
        updateLineNumbers(jsonInput, inputLineNumbers);
    });
    jsonInput.addEventListener('scroll', () => {
        inputLineNumbers.scrollTop = jsonInput.scrollTop;
    });
    // Init
    updateLineNumbers(jsonInput, inputLineNumbers);
}

if (jsonOutput && outputLineNumbers) {
    jsonOutput.addEventListener('scroll', () => {
        outputLineNumbers.scrollTop = jsonOutput.scrollTop;
    });
}
