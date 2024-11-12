const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// SVG file paths
const inputDirPath = path.join(
    __dirname, 
    '..',
    'views',
    'components',
    'icon',
    'svg'
);
const outputDirPath = inputDirPath

function processSvgFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
        }

        // Parse SVG content
        const dom = new JSDOM(data, { contentType: 'image/svg+xml' });
        const svgElement = dom.window.document.querySelector('svg');

        // Remove unwanted attributes
        svgElement.removeAttribute('xmlns');
        svgElement.removeAttribute('width');
        svgElement.removeAttribute('height');
        svgElement.removeAttribute('stroke-width');
        svgElement.removeAttribute('class');

        // Construct Pug mixin template
        let pugMixin = `mixin ${path.basename(filePath, '.svg')}Icon(attrs={})\n`;
        pugMixin += `\tsvg(viewBox="${svgElement.getAttribute('viewBox') || '0 0 24 24'}" fill="${svgElement.getAttribute('fill') || 'none'}" stroke="${svgElement.getAttribute('stroke') || 'currentColor'}" stroke-linecap="${svgElement.getAttribute('stroke-linecap') || 'round'}" stroke-linejoin="${svgElement.getAttribute('stroke-linejoin') || 'round'}")&attributes(attrs)\n`;

        // Loop through each SVG child node and convert to Pug syntax
        svgElement.querySelectorAll('path').forEach(path => {
            const d = path.getAttribute('d');
            const stroke = path.getAttribute('stroke');
            pugMixin += '\t\tpath(';

            if (stroke) {
                pugMixin += `stroke="${stroke}" `
            }

            pugMixin += `d="${d}")\n`
        });

        // Output file path
        const outputFilePath = path.join(outputDirPath, `${path.basename(filePath, '.svg')}Icon.pug`);

        // Write the Pug mixin to a new file
        fs.writeFile(outputFilePath, pugMixin, (err) => {
            if (err) {
                console.error(`Error writing Pug file ${outputFilePath}:`, err);
            } else {
                console.log(`Pug mixin generated successfully: ${outputFilePath}`);
            }
        });
    });
}

// Read all SVG files in the directory and process each one
fs.readdir(inputDirPath, (err, files) => {
    if (err) {
        console.error('Error reading input directory:', err);
        return;
    }

    // Filter only .svg files and process each
    files.filter(file => path.extname(file) === '.svg').forEach(file => {
        const filePath = path.join(inputDirPath, file);
        processSvgFile(filePath);
    });
});