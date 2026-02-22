document.addEventListener('DOMContentLoaded', () => {
    const listInput = document.getElementById('list-input');
    const wrapperInput = document.getElementById('wrapper-input');
    const separatorInput = document.getElementById('separator-input');
    const queryOutput = document.getElementById('query-output');
    const inputLineNums = document.getElementById('input-line-numbers');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast');

    // ── Line numbers ─────────────────────────────────────────────
    function updateLineNums() {
        const count = listInput.value.split('\n').length;
        inputLineNums.innerHTML = Array.from({ length: count }, (_, i) => i + 1).join('<br>');
    }
    listInput.addEventListener('input', updateLineNums);
    listInput.addEventListener('scroll', () => { inputLineNums.scrollTop = listInput.scrollTop; });
    updateLineNums();

    // ── Toast ─────────────────────────────────────────────────────
    function showToast(msg, isError = false) {
        toast.textContent = msg;
        toast.style.backgroundColor = isError ? '#ef4444' : '';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }

    // ── Clear ─────────────────────────────────────────────────────
    clearBtn.addEventListener('click', () => {
        listInput.value = '';
        queryOutput.textContent = '';
        updateLineNums();
    });

    // ── Copy ─────────────────────────────────────────────────────
    copyBtn.addEventListener('click', () => {
        const text = queryOutput.textContent;
        if (!text.trim()) return;
        navigator.clipboard.writeText(text)
            .then(() => showToast('Copied to clipboard!'))
            .catch(() => showToast('Copy failed', true));
    });

    // ── Generate ─────────────────────────────────────────────────
    generateBtn.addEventListener('click', () => {
        // Split lines, filter out completely empty trailing lines
        const lines = listInput.value
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0);

        if (lines.length === 0) {
            showToast('Please add at least one line.', true);
            return;
        }

        const wrapper = wrapperInput.value;   // e.g. '
        const separator = separatorInput.value !== '' ? separatorInput.value : ',';

        // Wrap each line: wrapper + line + wrapper
        const result = lines
            .map(line => `${wrapper}${line}${wrapper}`)
            .join(separator);

        queryOutput.textContent = result;
    });

    // Allow pressing Enter is natural in textarea; also support Ctrl/Cmd+Enter to generate
    listInput.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateBtn.click();
        }
    });
});
