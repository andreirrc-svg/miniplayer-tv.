const fs = require('fs');
const puppeteer = require('puppeteer');

const CHANNELS = ['protv', 'antena1', 'kanald', 'digi24', 'digisport1', 'prima', 'hbomax'];

async function scrapeAll() {
    console.log('Pornire scraper...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = {};

    for (const slug of CHANNELS) {
        try {
            console.log(`Extragere stream pentru: ${slug}`);
            const page = await browser.newPage();
            let foundUrl = null;

            page.on('request', request => {
                const url = request.url();
                if (url.includes('.m3u8') && !foundUrl) {
                    foundUrl = url;
                }
            });

            await page.goto(`https://cool-tv.net/ch/${slug}.html`, {
                waitUntil: 'networkidle2',
                timeout: 25000
            }).catch(() => {});

            if (foundUrl) {
                results[slug] = foundUrl;
                console.log(`Succes [${slug}]: ${foundUrl}`);
            } else {
                console.log(`Eșec [${slug}]: Stream negăsit`);
            }
            await page.close();
        } catch (e) {
            console.log(`Eroare [${slug}]: ${e.message}`);
        }
    }

    await browser.close();

    fs.writeFileSync('streams.json', JSON.stringify(results, null, 2));
    console.log('Fisierul streams.json a fost generat cu succes!');
}

scrapeAll();
