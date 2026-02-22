const fs = require('fs');
const path = require('path');

const dir = '/Users/godgrace/project/json-astra';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'json-diff.html');

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update dropdown
    // Finding: <a href="json-unescape.html">Unescape</a>\n                    <a href="json-xml.html">JSON to XML</a>
    const dropdownRegex = /(<a href="json-unescape\.html"[^>]*>Unescape<\/a>\s*)(<a href="json-xml\.html">JSON to XML<\/a>)/g;
    content = content.replace(dropdownRegex, '$1<a href="json-diff.html">JSON Diff</a>\n                    $2');

    // 2. Update footer
    // Finding: <li><a href="json-unescape.html">JSON Unescape</a></li>\n                    <li><a href="json-xml.html">JSON to XML</a></li>
    const footerRegex = /(<li><a href="json-unescape\.html">JSON Unescape<\/a><\/li>\s*)(<li><a href="json-xml\.html">JSON to XML<\/a><\/li>)/g;
    content = content.replace(footerRegex, '$1<li><a href="json-diff.html">JSON Diff</a></li>\n                    $2');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}
