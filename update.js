const fs = require('fs');
const path = require('path');

const dir = '/Users/godgrace/project/json-astra';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'xml-xsd.html');

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add "XML to XSD" to the XML dropdown nav (after "XML to JSON")
    content = content.replace(
        /<a href="xml-json\.html">XML to JSON<\/a>\s*<\/div>/,
        '<a href="xml-json.html">XML to JSON</a>\n                    <a href="xml-xsd.html">XML to XSD</a>\n                </div>'
    );

    // 2. Add "XML to XSD" to footer XML Tools section
    content = content.replace(
        /<li><a href="xml-json\.html">XML to JSON<\/a><\/li>\s*<\/ul>/,
        '<li><a href="xml-json.html">XML to JSON</a></li>\n                    <li><a href="xml-xsd.html">XML to XSD</a></li>\n                </ul>'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
}
