// txt-formatter.js — Text Formatter / Template Replacer

// ── DOM refs ──────────────────────────────────────────────
const listInput = document.getElementById('list-input');
const templateInput = document.getElementById('template-input');
const outputEl = document.getElementById('txt-output');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const outputLineNums = document.getElementById('output-line-numbers');

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

// ── Line numbers ───────────────────────────────────────────
function updateOutputLineNumbers() {
    const val = outputEl.textContent;
    if (!val.trim()) {
        outputLineNums.innerHTML = '';
        return;
    }
    const lines = val.split(/\r\n|\r|\n/).length;
    if (outputLineNums.childElementCount === lines && lines > 0) return;
    outputLineNums.innerHTML = Array(lines).fill(0).map((_, i) => `<div>${i + 1}</div>`).join('');
}

// ── Generate ───────────────────────────────────────────────
function generate() {
    const listRaw = listInput.value;
    const template = templateInput.value;

    if (!template.trim()) {
        outputEl.innerHTML = `<span class="error">Please enter a template in the Template tab.</span>`;
        updateOutputLineNumbers();
        return;
    }

    const rows = listRaw.split(/\r\n|\r|\n/);

    if (rows.length === 0 || (rows.length === 1 && rows[0].trim() === '')) {
        outputEl.innerHTML = `<span class="error">Please enter at least one item in the List tab.</span>`;
        updateOutputLineNumbers();
        return;
    }

    const result = rows
        .filter(row => row.length > 0)         // skip truly empty lines
        .map(row => template.replace(/\$/g, row))
        .join('\n');

    outputEl.textContent = result;
    updateOutputLineNumbers();
}

// ── Event listeners ────────────────────────────────────────
generateBtn.addEventListener('click', generate);

clearBtn.addEventListener('click', () => {
    listInput.value = '';
    templateInput.value = '';
    outputEl.textContent = '';
    outputLineNums.innerHTML = '';
});

copyBtn.addEventListener('click', () => {
    const text = outputEl.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
    });
});

outputEl.addEventListener('scroll', () => {
    outputLineNums.scrollTop = outputEl.scrollTop;
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
