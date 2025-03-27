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

    // Počkáme, kým sa články zobrazia
    await page.waitForSelector('h2.post-title a', { timeout: 5000 });

    const articles = await page.evaluate(() => {
      const nodes = document.querySelectorAll('h2.post-title a');
      return Array.from(nodes).map(node => ({
        title: node.innerText.trim(),
        url: node.href
      }));
    });

    await browser.close();
    res.json({ source: 'zdravotnickydenik', count: articles.length, articles });
  } catch (error) {
    res.status(500).json({ error: 'Scraping failed', details: error.toString() });
  }
});

app.get('/', (req, res) => {
  res.send('🩺 Scraper API beží. Použi /zdravotnickydenik');
});

app.listen(PORT, () => {
  console.log(`Server beží na porte ${PORT}`);
});