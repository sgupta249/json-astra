document.addEventListener('DOMContentLoaded', () => {
    const leftInput = document.getElementById('json-input-left');
    const rightInput = document.getElementById('json-input-right');
    const leftOutput = document.getElementById('json-output-left');
    const rightOutput = document.getElementById('json-output');
    const leftLineNumbers = document.getElementById('left-line-numbers');
    const rightLineNumbers = document.getElementById('right-line-numbers');
    const compareBtn = document.getElementById('compare-btn');
    const clearLeftBtn = document.getElementById('clear-left-btn');
    const clearRightBtn = document.getElementById('clear-right-btn');
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast');

    // ── Line numbers ──────────────────────────────────────────────
    function updateLineNumbers(textarea, container) {
        const count = textarea.value.split('\n').length;
        container.innerHTML = Array.from({ length: count }, (_, i) => i + 1).join('<br>');
    }

    function syncScroll(textarea, container) {
        container.scrollTop = textarea.scrollTop;
    }

    [{ el: leftInput, ln: leftLineNumbers }, { el: rightInput, ln: rightLineNumbers }].forEach(({ el, ln }) => {
        el.addEventListener('input', () => updateLineNumbers(el, ln));
        el.addEventListener('scroll', () => syncScroll(el, ln));
        updateLineNumbers(el, ln);
    });

    leftOutput.addEventListener('scroll', () => { leftLineNumbers.scrollTop = leftOutput.scrollTop; });
    rightOutput.addEventListener('scroll', () => { rightLineNumbers.scrollTop = rightOutput.scrollTop; });

    // ── Toast ───────────────────────────────────────────────────────
    function showToast(msg, type = '') {
        toast.textContent = msg;
        toast.style.backgroundColor = type === 'error' ? '#ef4444' : '';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }

    // ── Copy ────────────────────────────────────────────────────────
    copyBtn.addEventListener('click', () => {
        const text = rightOutput.innerText || rightInput.value;
        if (!text.trim()) return;
        navigator.clipboard.writeText(text)
            .then(() => showToast('Copied to clipboard!'))
            .catch(() => showToast('Copy failed'));
    });

    // ── Escape HTML ─────────────────────────────────────────────────
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Build highlighted HTML for one side ─────────────────────────
    // lines: string[] — the lines to render
    // otherSet: Set<string> — trimmed lines from the OTHER side
    // identical: boolean — if true, render all lines green
    function buildDiffHTML(lines, otherSet, identical) {
        return lines.map(line => {
            const trimmed = line.trim();
            let cls;
            if (identical) {
                cls = 'diff-line-identical';
            } else {
                const isDiff = trimmed !== '' && !otherSet.has(trimmed);
                cls = isDiff ? 'diff-line-changed' : 'diff-line-normal';
            }
            return `<span class="${cls}">${escapeHTML(line)}</span>`;
        }).join('');
    }

    // ── Show diff in both panels ────────────────────────────────────
    function showDiff(leftLines, rightLines, identical) {
        const leftSet = new Set(leftLines.map(l => l.trim()));
        const rightSet = new Set(rightLines.map(l => l.trim()));

        // Left panel: highlight lines not present in right
        leftInput.style.display = 'none';
        leftOutput.innerHTML = buildDiffHTML(leftLines, rightSet, identical);
        leftOutput.style.display = 'block';
        leftLineNumbers.innerHTML = Array.from({ length: leftLines.length }, (_, i) => i + 1).join('<br>');

        // Right panel: highlight lines not present in left
        rightInput.style.display = 'none';
        rightOutput.innerHTML = buildDiffHTML(rightLines, leftSet, identical);
        rightOutput.style.display = 'block';
        rightLineNumbers.innerHTML = Array.from({ length: rightLines.length }, (_, i) => i + 1).join('<br>');
    }

    // ── Reset to input mode ─────────────────────────────────────────
    function resetView() {
        leftOutput.style.display = 'none';
        rightOutput.style.display = 'none';
        leftInput.style.display = '';
        rightInput.style.display = '';
        leftOutput.innerHTML = '';
        rightOutput.innerHTML = '';
        updateLineNumbers(leftInput, leftLineNumbers);
        updateLineNumbers(rightInput, rightLineNumbers);
    }

    // Clicking on either output panel → back to edit mode
    leftOutput.addEventListener('click', () => { resetView(); leftInput.focus(); });
    rightOutput.addEventListener('click', () => { resetView(); rightInput.focus(); });

    clearLeftBtn.addEventListener('click', () => {
        leftInput.value = '';
        resetView();
    });

    clearRightBtn.addEventListener('click', () => {
        rightInput.value = '';
        resetView();
    });

    // ── Compare ─────────────────────────────────────────────────────
    compareBtn.addEventListener('click', () => {
        const leftVal = leftInput.value.trim();
        const rightVal = rightInput.value.trim();

        if (!leftVal || !rightVal) {
            showToast('Please paste JSON into both panels.');
            return;
        }

        let leftObj, rightObj;

        try { leftObj = JSON.parse(leftVal); }
        catch (e) { showToast('Error in Original JSON: ' + e.message); return; }

        try { rightObj = JSON.parse(rightVal); }
        catch (e) { showToast('Error in Modified JSON: ' + e.message); return; }

        const leftLines = JSON.stringify(leftObj, null, 2).split('\n');
        const rightLines = JSON.stringify(rightObj, null, 2).split('\n');

        // Check if any line in right is missing from left (or vice versa)
        const leftSet = new Set(leftLines.map(l => l.trim()));
        const rightSet = new Set(rightLines.map(l => l.trim()));
        const hasDiff = rightLines.some(l => l.trim() !== '' && !leftSet.has(l.trim()))
            || leftLines.some(l => l.trim() !== '' && !rightSet.has(l.trim()));

        if (hasDiff) {
            showToast('⚠ Differences found in the provided JSON!', 'error');
            showDiff(leftLines, rightLines, false);
        } else {
            showToast('✓ Both JSON objects are identical!');
            showDiff(leftLines, rightLines, true);
        }
    });
});
