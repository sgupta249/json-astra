document.addEventListener('DOMContentLoaded', () => {
    const xmlInput = document.getElementById('xml-input');
    const xsdOutput = document.getElementById('xsd-output');
    const inputLineNums = document.getElementById('input-line-numbers');
    const outputLineNums = document.getElementById('output-line-numbers');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast');

    // ── Line numbers ──────────────────────────────────────────────
    function updateInputLineNums() {
        const count = xmlInput.value.split('\n').length;
        inputLineNums.innerHTML = Array.from({ length: count }, (_, i) => i + 1).join('<br>');
    }
    xmlInput.addEventListener('input', updateInputLineNums);
    xmlInput.addEventListener('scroll', () => { inputLineNums.scrollTop = xmlInput.scrollTop; });
    xsdOutput.addEventListener('scroll', () => { outputLineNums.scrollTop = xsdOutput.scrollTop; });
    updateInputLineNums();

    // ── Toast ──────────────────────────────────────────────────────
    function showToast(msg, isError = false) {
        toast.textContent = msg;
        toast.style.backgroundColor = isError ? '#ef4444' : '';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }

    // ── Clear ──────────────────────────────────────────────────────
    clearBtn.addEventListener('click', () => {
        xmlInput.value = '';
        xsdOutput.innerHTML = '';
        outputLineNums.innerHTML = '';
        updateInputLineNums();
    });

    // ── Copy ──────────────────────────────────────────────────────
    copyBtn.addEventListener('click', () => {
        const text = xsdOutput.innerText;
        if (!text.trim()) return;
        navigator.clipboard.writeText(text)
            .then(() => showToast('Copied to clipboard!'))
            .catch(() => showToast('Copy failed', true));
    });

    // ── XSD Generator ─────────────────────────────────────────────

    /**
     * Recursively infer the XSD type for an XML Element node.
     * Returns an XSD snippet string (without leading xs:schema wrapper).
     */
    function inferElement(element, indent) {
        const pad = '  '.repeat(indent);
        const name = element.tagName;

        // Collect child elements (ignore text/comment nodes)
        const childElements = Array.from(element.childNodes)
            .filter(n => n.nodeType === Node.ELEMENT_NODE);

        // Collect attributes
        const attrs = Array.from(element.attributes);

        const isSimple = childElements.length === 0 && attrs.length === 0;

        if (isSimple) {
            // Determine a simple type from text content
            const text = (element.textContent || '').trim();
            const xsType = inferSimpleType(text);
            return `${pad}<xs:element name="${name}" type="${xsType}"/>`;
        }

        // Complex type
        let lines = [];
        lines.push(`${pad}<xs:element name="${name}">`);
        lines.push(`${pad}  <xs:complexType>`);

        if (childElements.length > 0) {
            // Deduplicate child element names for sequence
            const seen = new Set();
            const uniqueChildren = childElements.filter(c => {
                if (seen.has(c.tagName)) return false;
                seen.add(c.tagName);
                return true;
            });

            lines.push(`${pad}    <xs:sequence>`);
            uniqueChildren.forEach(child => {
                const childSnippet = inferElement(child, indent + 3);
                // Check if element occurs multiple times → maxOccurs unbounded
                const occurrences = childElements.filter(c => c.tagName === child.tagName).length;
                if (occurrences > 1) {
                    // Wrap with maxOccurs
                    const innerSnippet = inferElement(child, indent + 3);
                    // Add maxOccurs="unbounded" to the xs:element tag
                    lines.push(innerSnippet.replace(/<xs:element /, `<xs:element maxOccurs="unbounded" `));
                } else {
                    lines.push(childSnippet);
                }
            });
            lines.push(`${pad}    </xs:sequence>`);
        }

        // Attributes
        attrs.forEach(attr => {
            const attrType = inferSimpleType(attr.value);
            lines.push(`${pad}    <xs:attribute name="${attr.name}" type="${attrType}" use="optional"/>`);
        });

        lines.push(`${pad}  </xs:complexType>`);
        lines.push(`${pad}</xs:element>`);
        return lines.join('\n');
    }

    /**
     * Guess an XSD simple type from a string value.
     */
    function inferSimpleType(value) {
        const v = (value || '').trim();
        if (v === '') return 'xs:string';
        if (/^-?\d+$/.test(v)) return 'xs:integer';
        if (/^-?\d+\.\d+$/.test(v)) return 'xs:decimal';
        if (/^(true|false)$/i.test(v)) return 'xs:boolean';
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'xs:date';
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) return 'xs:dateTime';
        return 'xs:string';
    }

    /**
     * Escape XML special chars for rendering in the output div.
     */
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Convert Button ────────────────────────────────────────────
    convertBtn.addEventListener('click', () => {
        const raw = xmlInput.value.trim();
        if (!raw) {
            showToast('Please paste XML to convert.', true);
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(raw, 'application/xml');

        // Check for parse errors
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            showToast('XML parse error: ' + parseError.textContent.split('\n')[0], true);
            return;
        }

        const root = doc.documentElement;

        const xsdLines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">',
            inferElement(root, 1),
            '</xs:schema>'
        ];

        const xsdText = xsdLines.join('\n');
        const escaped = escapeHTML(xsdText);

        xsdOutput.innerHTML = escaped;

        // Update output line numbers
        const lineCount = xsdText.split('\n').length;
        outputLineNums.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
    });
});
