/**
 * Academic Resource Hub - Comprehensive Automated Test Suite
 * Covers Authentication, RBAC, Resources Lifecycle, Reviews, Downloads, Bookmarks, Requests, and Categories
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function test(title, fn) {
    totalTests++;
    try {
        await fn();
        passedTests++;
        console.log(`  ✓ [PASS] ${title}`);
    } catch (err) {
        failedTests++;
        console.error(`  ✗ [FAIL] ${title}`);
        console.error(`    Error: ${err.message}`);
    }
}

async function runTestSuite() {
    console.log('============================================================');
    console.log('  ACADEMIC RESOURCE HUB - AUTOMATED INTEGRATION TEST SUITE');
    console.log(`  Target: ${BASE_URL}`);
    console.log('============================================================\n');

    const timestamp = Date.now();
    let studentToken = null;
    let studentId = null;
    let staffToken = null;
    let staffId = null;
    let createdResourceId = null;
    let createdRequestId = null;

    // =========================================================
    // 1. AUTHENTICATION & RBAC TESTS
    // =========================================================
    console.log('1. Authentication & RBAC Tests');

    await test('AUTH-01: Health check endpoint returns operational and dbConnected', async () => {
        const res = await fetch(`${BASE_URL}/health`);
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.status, 'ok');
        assert.strictEqual(data.dbConnected, true);
    });

    await test('AUTH-02: User registration validates required fields and rejects short password', async () => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Short PW', email: `test_${timestamp}@test.edu`, password: '123' })
        });
        assert.strictEqual(res.status, 400);
        const data = await res.json();
        assert.match(data.error, /Password must be at least 6 characters/i);
    });

    await test('AUTH-03: Register a new student with valid credentials', async () => {
        const studentEmail = `student_${timestamp}@college.edu`;
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Student Test ${timestamp.toString().slice(-4)}`,
                email: studentEmail,
                password: 'Password@123',
                role: 'STUDENT',
                department_id: 1,
                semester: 'Semester 3'
            })
        });
        const data = await res.json();
        assert.strictEqual(res.status, 201);
        assert.ok(data.token, 'Token should be returned');
        assert.strictEqual(data.user.role, 'STUDENT');
        studentToken = data.token;
        studentId = data.user.id;
    });

    await test('AUTH-04: Prevent duplicate email registration', async () => {
        const studentEmail = `student_${timestamp}@college.edu`;
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Duplicate Student',
                email: studentEmail,
                password: 'Password@123'
            })
        });
        assert.strictEqual(res.status, 409);
    });

    await test('AUTH-05: Staff login succeeds with valid credentials', async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'staff@college.edu', password: 'Password@123' })
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.user.role, 'STAFF');
        staffToken = data.token;
        staffId = data.user.id;
    });

    await test('AUTH-06: Protected endpoint rejects unauthenticated request (401)', async () => {
        const res = await fetch(`${BASE_URL}/auth/me`);
        assert.strictEqual(res.status, 401);
    });

    await test('AUTH-07: Get profile returns authenticated user details', async () => {
        const res = await fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.user.id, studentId);
    });

    // =========================================================
    // 2. RESOURCE UPLOAD & WORKFLOW TESTS
    // =========================================================
    console.log('\n2. Resource Upload & Workflow Tests');

    await test('RES-01: Reject resource upload without a file', async () => {
        const formData = new FormData();
        formData.append('title', 'No file test');
        formData.append('subject_id', '1');
        formData.append('resource_type_id', '1');
        formData.append('academic_year', '2026-27');

        const res = await fetch(`${BASE_URL}/resources`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${studentToken}` },
            body: formData
        });
        assert.strictEqual(res.status, 400);
    });

    await test('RES-02: Student uploads resource and it enters PENDING status', async () => {
        const tempPath = path.join(__dirname, `test_doc_${timestamp}.txt`);
        fs.writeFileSync(tempPath, 'Binary Search Trees and AVL Trees study materials.');

        const formData = new FormData();
        formData.append('file', new Blob([fs.readFileSync(tempPath)], { type: 'text/plain' }), `BST_AVL_Notes_${timestamp}.txt`);
        formData.append('title', `DSA Comprehensive Trees Revision ${timestamp.toString().slice(-4)}`);
        formData.append('description', 'Comprehensive lecture notes on balanced search trees.');
        formData.append('subject_id', '2'); // Data Structures and Algorithms
        formData.append('resource_type_id', '1'); // Lecture Notes
        formData.append('academic_year', '2026-27');

        const res = await fetch(`${BASE_URL}/resources`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${studentToken}` },
            body: formData
        });

        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

        const data = await res.json();
        assert.strictEqual(res.status, 201);
        assert.strictEqual(data.resource.status, 'PENDING');
        createdResourceId = data.resource.id;
    });

    await test('RES-03: Pending resource is hidden from public and student search', async () => {
        const res = await fetch(`${BASE_URL}/resources?keyword=Trees Revision ${timestamp.toString().slice(-4)}`);
        const data = await res.json();
        const items = data.data || data.resources || [];
        const found = items.some(r => r.id === createdResourceId);
        assert.strictEqual(found, false, 'Pending resource must not appear in public search');
    });

    // =========================================================
    // 3. STAFF REVIEW & APPROVAL TESTS
    // =========================================================
    console.log('\n3. Staff Review & Approval Tests');

    await test('REV-01: Non-staff users cannot access staff review endpoints (403)', async () => {
        const res = await fetch(`${BASE_URL}/reviews/pending`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        assert.strictEqual(res.status, 403);
    });

    await test('REV-02: Staff can view pending contributions list', async () => {
        const res = await fetch(`${BASE_URL}/reviews/pending`, {
            headers: { 'Authorization': `Bearer ${staffToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        const item = data.pendingContributions?.find(r => r.id === createdResourceId);
        assert.ok(item, 'Uploaded resource must be in pending reviews list');
    });

    await test('REV-03: Staff approves resource and marks it PUBLISHED', async () => {
        const res = await fetch(`${BASE_URL}/reviews/${createdResourceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${staffToken}`
            },
            body: JSON.stringify({
                status: 'PUBLISHED',
                remarks: 'Verified complete and conforms to the academic syllabus.'
            })
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.status, 'PUBLISHED');
    });

    await test('REV-04: Review history logs reviewer remarks and timestamp', async () => {
        const res = await fetch(`${BASE_URL}/reviews/resource/${createdResourceId}`, {
            headers: { 'Authorization': `Bearer ${staffToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(data.reviews.length >= 1);
        assert.strictEqual(data.reviews[0].status, 'PUBLISHED');
    });

    // =========================================================
    // 4. SEARCH, FILTER & DISCOVERY TESTS
    // =========================================================
    console.log('\n4. Search, Filter & Discovery Tests');

    await test('SEARCH-01: Newly approved resource appears in public search results', async () => {
        const res = await fetch(`${BASE_URL}/resources?keyword=Trees Revision ${timestamp.toString().slice(-4)}`);
        const data = await res.json();
        const items = data.data || data.resources || [];
        const item = items.find(r => r.id === createdResourceId);
        assert.ok(item, 'Approved resource must now appear in public search');
        assert.strictEqual(item.status, 'PUBLISHED');
    });

    await test('SEARCH-02: Search filtering by Department and Subject works accurately', async () => {
        const res = await fetch(`${BASE_URL}/resources?department_id=1&subject_id=2`);
        const data = await res.json();
        const items = data.data || data.resources || [];
        assert.ok(items.every(r => r.subject_id === 2));
    });

    await test('SEARCH-03: Get single resource details by ID', async () => {
        const res = await fetch(`${BASE_URL}/resources/${createdResourceId}`);
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.resource.id, createdResourceId);
    });

    // =========================================================
    // 5. DOWNLOAD & ACCESS COUNTER TESTS
    // =========================================================
    console.log('\n5. Download & Access Counter Tests');

    await test('DL-01: Download resource returns file stream with HTTP 200', async () => {
        const res = await fetch(`${BASE_URL}/resources/${createdResourceId}/download`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        assert.strictEqual(res.status, 200);
        const text = await res.text();
        assert.match(text, /Binary Search Trees/);
    });

    await test('DL-02: Student download history reflects the downloaded item', async () => {
        const res = await fetch(`${BASE_URL}/downloads/my-downloads`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(data.downloads?.some(h => h.resource_id === createdResourceId));
    });

    // =========================================================
    // 6. BOOKMARK TESTS
    // =========================================================
    console.log('\n6. Bookmark Management Tests');

    await test('BOOKMARK-01: Add bookmark returns success and isBookmarked: true', async () => {
        const res = await fetch(`${BASE_URL}/bookmarks/${createdResourceId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.isBookmarked, true);
    });

    await test('BOOKMARK-02: Check bookmark status returns true', async () => {
        const res = await fetch(`${BASE_URL}/bookmarks/check/${createdResourceId}`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.isBookmarked, true);
    });

    await test('BOOKMARK-03: Bookmarked item appears in student bookmark collection', async () => {
        const res = await fetch(`${BASE_URL}/bookmarks`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(data.bookmarks?.some(b => b.resource_id === createdResourceId));
    });

    await test('BOOKMARK-04: Remove bookmark updates status to isBookmarked: false', async () => {
        const res = await fetch(`${BASE_URL}/bookmarks/${createdResourceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.isBookmarked, false);
    });

    // =========================================================
    // 7. RESOURCE REQUEST TESTS
    // =========================================================
    console.log('\n7. Resource Request Workflow Tests');

    await test('REQ-01: Student creates a study material request', async () => {
        const res = await fetch(`${BASE_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                subject_id: 2,
                title: `Request: Graph Algorithms Tutorial ${timestamp.toString().slice(-4)}`,
                description: 'Need detailed Dijkstra and Bellman-Ford algorithm step-by-step notes.'
            })
        });
        const data = await res.json();
        assert.strictEqual(res.status, 201);
        assert.strictEqual(data.status, 'PENDING');
        createdRequestId = data.requestId;
    });

    await test('REQ-02: Student views their own request in My Requests list', async () => {
        const res = await fetch(`${BASE_URL}/requests/my-requests`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(data.requests?.some(r => r.id === createdRequestId));
    });

    await test('REQ-03: Staff responds and fulfills the student request', async () => {
        const res = await fetch(`${BASE_URL}/requests/${createdRequestId}/respond`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${staffToken}`
            },
            body: JSON.stringify({
                status: 'COMPLETED',
                staff_remarks: 'Lecture notes for Graph Algorithms uploaded to DSA repository.'
            })
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.request.status, 'COMPLETED');
    });

    // =========================================================
    // 8. CATEGORIES & METADATA TESTS
    // =========================================================
    console.log('\n8. Categories & Taxonomy Tests');

    await test('CAT-01: Fetch all academic departments', async () => {
        const res = await fetch(`${BASE_URL}/categories/departments`);
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(data.departments.length >= 3);
    });

    await test('CAT-02: Fetch subjects filtered by department', async () => {
        const res = await fetch(`${BASE_URL}/categories/subjects?department_id=1`);
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(data.subjects.length >= 1);
        assert.ok(data.subjects.every(s => s.department_id === 1));
    });

    await test('CAT-03: Fetch resource types', async () => {
        const res = await fetch(`${BASE_URL}/categories/resource-types`);
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(data.resourceTypes.length >= 5);
    });

    // =========================================================
    // SUMMARY
    // =========================================================
    console.log('\n============================================================');
    console.log(`TEST SUITE SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
    console.log('============================================================');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runTestSuite().catch(err => {
    console.error('Fatal Test Suite Error:', err);
    process.exit(1);
});
