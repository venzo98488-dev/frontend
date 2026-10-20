const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, 'backend', 'node_modules', 'puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = 'http://egspec.com:3000';

const OUTPUT_DIRS = [
    path.join(__dirname, 'docs', 'screenshots'),
    'C:\\Users\\User\\.gemini\\antigravity\\brain\\d3e4771a-fd60-4a77-8ddb-5bdff3876b3a\\screenshots'
];

OUTPUT_DIRS.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

async function saveScreenshot(page, filename) {
    for (const dir of OUTPUT_DIRS) {
        const fullPath = path.join(dir, filename);
        await page.screenshot({ path: fullPath, fullPage: false });
    }
    console.log(`✓ Captured: ${filename}`);
}

async function captureAI() {
    console.log('Launching Chrome to capture AI Tools and Doubt Assistant screens...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();

    // 1. Dedicated AI Tools Suite
    console.log('Navigating to AI Tools page at egspec.com...');
    await page.goto(`${FRONTEND_URL}/ai-tools`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Fill in a sample doubt to show interactive results
    const textarea = await page.$('textarea');
    if (textarea) {
        await textarea.type('Explain ACID properties in DBMS');
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            await submitBtn.click();
            await new Promise(r => setTimeout(r, 1200));
        }
    }
    await saveScreenshot(page, '16_ai_tools_suite.png');

    // 2. Global AI Doubt Assistant Drawer open on Resources page
    console.log('Navigating to Resources and opening Global AI Assistant...');
    await page.goto(`${FRONTEND_URL}/resources`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const trigger = buttons.find(b => b.innerText.includes('AI Doubts') || b.innerText.includes('EGSPEC'));
        if (trigger) trigger.click();
    });
    await new Promise(r => setTimeout(r, 600));
    
    // Click on a prompt chip, e.g. "BCNF"
    await page.evaluate(() => {
        const chips = Array.from(document.querySelectorAll('button'));
        const bcnfChip = chips.find(c => c.innerText.includes('BCNF'));
        if (bcnfChip) bcnfChip.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '17_global_ai_doubt_assistant.png');

    await browser.close();
    console.log('All AI screenshots captured successfully!');
}

captureAI().catch(err => {
    console.error('Capture error:', err);
    process.exit(1);
});
