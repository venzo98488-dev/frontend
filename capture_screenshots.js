const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000/api';

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

async function capture() {
    console.log('Launching Chrome to capture main Student and Staff screens...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();

    // 1. Login Screen
    console.log('Navigating to Login Screen...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[type="email"]');
    await saveScreenshot(page, '01_login_screen.png');

    // 2. Obtain Student token via API
    console.log('Logging in as Student (student@college.edu)...');
    const studentRes = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@college.edu', password: 'Password@123' })
    });
    const studentAuth = await studentRes.json();

    // Inject Student Session into page
    await page.evaluate((auth) => {
        localStorage.setItem('token', auth.token);
        localStorage.setItem('user', JSON.stringify(auth.user));
    }, studentAuth);

    // 3. Student Dashboard
    console.log('Navigating to Student Dashboard...');
    await page.goto(`${FRONTEND_URL}/student/dashboard`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '02_student_dashboard.png');

    // 4. Browse & Search Resources
    console.log('Navigating to Browse & Search Resources (/resources)...');
    await page.goto(`${FRONTEND_URL}/resources`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '03_student_resources.png');

    // 5. Student Contributions / Upload Screen
    console.log('Navigating to Student My Contributions (/student/contributions)...');
    await page.goto(`${FRONTEND_URL}/student/contributions`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '04_student_contributions.png');

    // 6. Student Bookmarks
    console.log('Navigating to Student Bookmarks (/student/bookmarks)...');
    await page.goto(`${FRONTEND_URL}/student/bookmarks`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '05_student_bookmarks.png');

    // 7. Student Requests
    console.log('Navigating to Student Requests (/student/requests)...');
    await page.goto(`${FRONTEND_URL}/student/requests`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '06_student_requests.png');

    // 8. Real-Time Doubt Clearance Chat
    console.log('Navigating to Real-Time Doubt Clearance Chat (/chat)...');
    await page.goto(`${FRONTEND_URL}/chat`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '07_doubt_clearance_chat.png');

    // 9. Obtain Staff Token
    console.log('Logging in as Staff (staff@college.edu)...');
    const staffRes = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'staff@college.edu', password: 'Password@123' })
    });
    const staffAuth = await staffRes.json();

    // Inject Staff Session
    await page.evaluate((auth) => {
        localStorage.setItem('token', auth.token);
        localStorage.setItem('user', JSON.stringify(auth.user));
    }, staffAuth);

    // 10. Staff Dashboard
    console.log('Navigating to Staff Dashboard (/staff/dashboard)...');
    await page.goto(`${FRONTEND_URL}/staff/dashboard`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '08_staff_dashboard.png');

    // 11. Staff Verify Contributions
    console.log('Navigating to Staff Verify Contributions (/staff/verify)...');
    await page.goto(`${FRONTEND_URL}/staff/verify`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '09_staff_verify_contributions.png');

    // 12. Staff Manage Resources
    console.log('Navigating to Staff Manage Resources (/staff/resources)...');
    await page.goto(`${FRONTEND_URL}/staff/resources`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '10_staff_manage_resources.png');

    // 13. Staff Manage Requests
    console.log('Navigating to Staff Requests Board (/staff/requests)...');
    await page.goto(`${FRONTEND_URL}/staff/requests`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '11_staff_manage_requests.png');

    // 14. Staff Download Analytics / Reports
    console.log('Navigating to Staff Reports & Analytics (/staff/reports)...');
    await page.goto(`${FRONTEND_URL}/staff/reports`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '12_staff_reports_analytics.png');

    // 15. Staff Subjects Taxonomy Management
    console.log('Navigating to Staff Subjects Management (/staff/subjects)...');
    await page.goto(`${FRONTEND_URL}/staff/subjects`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '13_staff_subjects_management.png');

    await browser.close();
    console.log('All screenshots captured successfully with correct URLs!');
}

capture().catch(err => {
    console.error('Screenshot capture failed:', err);
    process.exit(1);
});
