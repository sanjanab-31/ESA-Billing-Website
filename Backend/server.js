const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Increase payload limit for large HTML
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

app.post('/generate-pdf', async (req, res) => {
    const { html, css, baseUrl } = req.body;

    if (!html) {
        return res.status(400).send('HTML content is required');
    }

    try {
        console.log('Starting PDF generation...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('Browser launched');
        const page = await browser.newPage();
        console.log('Page created');

        // Set content
        // We construct a full HTML document ensuring styles are injected
        const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          ${baseUrl ? `<base href="${baseUrl}">` : ''}
          <style>
             /* Default styles to ensure print consistency */
             body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
          ${css || ''}
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

        console.log('Setting page content...');
        // Relax timeout to 60s and wait condition to 'load' initially to see if networkidle0 is the blocker
        await page.setContent(fullHtml, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        console.log('Content set. Generating PDF...');

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                right: '15mm',
                bottom: '15mm',
                left: '15mm'
            }
        });

        console.log('PDF generated successfully');
        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.listen(PORT, () => {
    console.log(`PDF Server running on http://localhost:${PORT}`);
});
