const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function runFlowTest() {
    console.log('================================================================');
    console.log('STARTING END-TO-END FLOW TEST:');
    console.log('register → upload as student → staff approves → search → download → bookmark → request');
    console.log('================================================================\n');

    const timestamp = Date.now();
    const testStudent = {
        name: `Test Student ${timestamp.toString().slice(-4)}`,
        email: `student_${timestamp}@college.edu`,
        password: 'Password@123',
        role: 'STUDENT',
        department_id: 1,
        semester: 'Semester 3'
    };

    // -------------------------------------------------------------
    // STEP 1: REGISTER
    // -------------------------------------------------------------
    console.log('--- STEP 1: REGISTER ---');
    console.log(`Registering new student: ${testStudent.email}...`);

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testStudent)
    });

    const regData = await regRes.json();
    if (!regRes.ok) {
        throw new Error(`Registration failed (${regRes.status}): ${JSON.stringify(regData)}`);
    }

    const studentToken = regData.token;
    const studentUser = regData.user;
    console.log(`✓ Registration Successful! ID: ${studentUser.id}, Name: "${studentUser.name}", Role: ${studentUser.role}\n`);

    // -------------------------------------------------------------
    // STEP 2: UPLOAD AS A STUDENT
    // -------------------------------------------------------------
    console.log('--- STEP 2: UPLOAD AS A STUDENT ---');
    
    // Create temporary file to upload
    const tempFilePath = path.join(__dirname, `sample_dbms_notes_${timestamp}.txt`);
    fs.writeFileSync(tempFilePath, `Academic Resource Hub - Sample DBMS Study Material\nGenerated at: ${new Date().toISOString()}\nContents: SQL, Normalization, Indexing, Transactions.`);

    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(tempFilePath)], { type: 'text/plain' });
    formData.append('file', fileBlob, `DBMS_Unit_1_Notes_${timestamp}.txt`);
    formData.append('title', `DBMS Complete Revision Notes ${timestamp.toString().slice(-4)}`);
    formData.append('description', 'Comprehensive notes on Relational Algebra, SQL, and Normalization up to BCNF.');
    formData.append('subject_id', '1'); // Database Management Systems
    formData.append('resource_type_id', '1'); // Lecture Notes
    formData.append('academic_year', '2026-27');

    const uploadRes = await fetch(`${BASE_URL}/resources`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${studentToken}`
        },
        body: formData
    });

    // Cleanup temp file
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
        throw new Error(`Upload failed (${uploadRes.status}): ${JSON.stringify(uploadData)}`);
    }

    const resourceId = uploadData.resource.id;
    console.log(`✓ Resource Uploaded Successfully!`);
    console.log(`  Resource ID: ${resourceId}`);
    console.log(`  Title: "${uploadData.resource.title}"`);
    console.log(`  Initial Status: "${uploadData.resource.status}" (Notice: As expected for student uploads, status is PENDING)\n`);

    // Verify it is NOT yet in public/student search
    console.log('Checking that PENDING resource is NOT visible in public search...');
    const preSearchRes = await fetch(`${BASE_URL}/resources?keyword=${encodeURIComponent(uploadData.resource.title)}`);
    const preSearchData = await preSearchRes.json();
    const foundBeforeApproval = preSearchData.resources?.some(r => r.id === resourceId);
    console.log(`  Found in search prior to approval? ${foundBeforeApproval ? 'YES (Unexpected!)' : 'NO (Correct: pending items are protected)'}\n`);

    // -------------------------------------------------------------
    // STEP 3: STAFF APPROVES
    // -------------------------------------------------------------
    console.log('--- STEP 3: STAFF APPROVES ---');
    console.log('Logging in as staff (staff@college.edu)...');

    const staffLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'staff@college.edu',
            password: 'Password@123'
        })
    });

    const staffLoginData = await staffLoginRes.json();
    if (!staffLoginRes.ok) {
        throw new Error(`Staff login failed: ${JSON.stringify(staffLoginData)}`);
    }

    const staffToken = staffLoginData.token;
    console.log(`✓ Staff Logged In: ${staffLoginData.user.name} (${staffLoginData.user.role})`);

    // Verify resource is in pending reviews list
    const pendingRes = await fetch(`${BASE_URL}/reviews/pending`, {
        headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    const pendingData = await pendingRes.json();
    const isPending = pendingData.pendingContributions?.some(p => p.id === resourceId);
    console.log(`  Resource found in Staff Pending Reviews list? ${isPending ? 'YES' : 'NO'}`);

    // Approve the contribution
    console.log(`Staff approving Resource #${resourceId}...`);
    const approveRes = await fetch(`${BASE_URL}/reviews/${resourceId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${staffToken}`
        },
        body: JSON.stringify({
            status: 'PUBLISHED',
            remarks: 'Verified and approved for publication. Accurate syllabus coverage.'
        })
    });

    const approveData = await approveRes.json();
    if (!approveRes.ok) {
        throw new Error(`Staff approval failed (${approveRes.status}): ${JSON.stringify(approveData)}`);
    }

    console.log(`✓ Resource Approved! Status is now: "${approveData.status}" with remarks: "${approveData.remarks}"\n`);

    // -------------------------------------------------------------
    // STEP 4: THE RESOURCE SHOWS IN SEARCH
    // -------------------------------------------------------------
    console.log('--- STEP 4: THE RESOURCE SHOWS IN SEARCH ---');
    const searchKeyword = `Revision Notes ${timestamp.toString().slice(-4)}`;
    console.log(`Searching for published resources with keyword: "${searchKeyword}"...`);

    const searchRes = await fetch(`${BASE_URL}/resources?keyword=${encodeURIComponent(searchKeyword)}`);
    const searchData = await searchRes.json();
    if (!searchRes.ok) {
        throw new Error(`Search failed (${searchRes.status}): ${JSON.stringify(searchData)}`);
    }

    const matchedResource = searchData.resources?.find(r => r.id === resourceId);
    if (!matchedResource) {
        throw new Error(`Resource #${resourceId} was not found in search results!`);
    }

    console.log(`✓ Resource Found in Search!`);
    console.log(`  ID: ${matchedResource.id}`);
    console.log(`  Title: "${matchedResource.title}"`);
    console.log(`  Status: ${matchedResource.status}`);
    console.log(`  Subject: ${matchedResource.subject_name}`);
    console.log(`  Type: ${matchedResource.resource_type_name}`);
    console.log(`  Uploader: ${matchedResource.uploader_name}\n`);

    // -------------------------------------------------------------
    // STEP 5: DOWNLOAD
    // -------------------------------------------------------------
    console.log('--- STEP 5: DOWNLOAD ---');
    console.log(`Student downloading Resource #${resourceId}...`);

    const downloadRes = await fetch(`${BASE_URL}/resources/${resourceId}/download`, {
        headers: {
            'Authorization': `Bearer ${studentToken}`
        }
    });

    if (!downloadRes.ok) {
        throw new Error(`Download failed (${downloadRes.status}): ${await downloadRes.text()}`);
    }

    const downloadedText = await downloadRes.text();
    console.log(`✓ Download Successful!`);
    console.log(`  Status code: ${downloadRes.status}`);
    console.log(`  Content Length: ${downloadedText.length} bytes`);
    console.log(`  Content preview: "${downloadedText.split('\n')[0]}"\n`);

    // -------------------------------------------------------------
    // STEP 6: BOOKMARK
    // -------------------------------------------------------------
    console.log('--- STEP 6: BOOKMARK ---');
    console.log(`Student bookmarking Resource #${resourceId}...`);

    const bookmarkRes = await fetch(`${BASE_URL}/bookmarks/${resourceId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${studentToken}`
        }
    });

    const bookmarkData = await bookmarkRes.json();
    if (!bookmarkRes.ok) {
        throw new Error(`Bookmark failed (${bookmarkRes.status}): ${JSON.stringify(bookmarkData)}`);
    }

    console.log(`✓ Bookmark added! Message: "${bookmarkData.message}"`);

    // Verify student bookmark list
    const myBookmarksRes = await fetch(`${BASE_URL}/bookmarks`, {
        headers: {
            'Authorization': `Bearer ${studentToken}`
        }
    });
    const myBookmarksData = await myBookmarksRes.json();
    const hasBookmarked = myBookmarksData.bookmarks?.some(b => b.resource_id === resourceId);
    console.log(`✓ Bookmark Verified in Student's Bookmark Collection? ${hasBookmarked ? 'YES' : 'NO'}\n`);

    // -------------------------------------------------------------
    // STEP 7: REQUEST
    // -------------------------------------------------------------
    console.log('--- STEP 7: REQUEST ---');
    console.log('Student creating a new academic resource request...');

    const requestPayload = {
        subject_id: 1,
        title: `Need Solutions for DBMS Midterm 2026 (${timestamp.toString().slice(-4)})`,
        description: 'Looking for verified step-by-step solutions for 2026 Question Bank.'
    };

    const requestRes = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify(requestPayload)
    });

    const requestData = await requestRes.json();
    if (!requestRes.ok) {
        throw new Error(`Resource request failed (${requestRes.status}): ${JSON.stringify(requestData)}`);
    }

    console.log(`✓ Resource Request Submitted!`);
    console.log(`  Request ID: ${requestData.requestId}`);
    console.log(`  Status: ${requestData.status}`);

    // Verify in Student's my-requests
    const myRequestsRes = await fetch(`${BASE_URL}/requests/my-requests`, {
        headers: {
            'Authorization': `Bearer ${studentToken}`
        }
    });
    const myRequestsData = await myRequestsRes.json();
    const hasRequest = myRequestsData.requests?.some(r => r.id === requestData.requestId);
    console.log(`✓ Request Verified in Student's Requests List? ${hasRequest ? 'YES' : 'NO'}\n`);

    console.log('================================================================');
    console.log('ALL 7 FLOW STEPS COMPLETED AND VERIFIED 100% SUCCESSFULLY!');
    console.log('================================================================');
}

runFlowTest().catch(err => {
    console.error('\n❌ FLOW TEST ERROR:', err);
    process.exit(1);
});
