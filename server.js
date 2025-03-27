const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/zdravotnickydenik', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://zdravotnickydenik.cz/kategorie/zpravy/', {
      waitUntil: 'networkidle2',
      timeout: 0
    });

    // Počkám 5 sekúnd navyše, aby sa načítal JS
    await page.waitForTimeout(5000);

    const html = await page.content();

    // Pošli späť len výrez HTML (kvôli limitu)
    res.send(html.slice(0, 3000) + "\n\n...skrátené...");
  } catch (error) {
    res.status(500).json({ error: 'Scraping failed', details: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server beží na porte ${PORT}`);
});