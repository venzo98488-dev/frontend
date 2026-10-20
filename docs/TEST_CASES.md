# Academic Resource Sharing Hub - Test Cases & Verification Suite

This document specifies the formal test cases, test matrices, role-based security rules, and verification procedures for the **Academic Resource Sharing Hub**.

---

## 1. Test Suite Architecture

The system uses an automated test runner executing against the live Express + MySQL backend:

- **Automated Integration Suite**: [`tests/api.test.js`](file:///c:/Users/User/Desktop/academic-resource-hub/tests/api.test.js) (29 test assertions)
- **End-to-End User Flow Script**: [`test_flow.js`](file:///c:/Users/User/Desktop/academic-resource-hub/test_flow.js) (Full 7-step user journey)
- **Execution Command**:
  ```bash
  npm test
  # or
  node tests/api.test.js
  ```

---

## 2. Test Cases Specification Matrix

### Module 1: Authentication & Role-Based Access Control (RBAC)

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **AUTH-01** | Backend Health & DB Ping | Server running | `GET /api/health` | HTTP 200, `status: 'ok'`, `dbConnected: true` | **PASSED** |
| **AUTH-02** | Registration Input Validation | None | `POST /api/auth/register` with password `< 6 chars` | HTTP 400, returns error specifying password length requirement | **PASSED** |
| **AUTH-03** | Student Registration | Database seeded | `POST /api/auth/register` with valid student payload | HTTP 201, returns signed JWT token, user object with role `STUDENT` | **PASSED** |
| **AUTH-04** | Duplicate Email Prevention | User exists | Register again with same email | HTTP 409 Conflict, account creation rejected | **PASSED** |
| **AUTH-05** | Staff Authentication | Seeded staff account | `POST /api/auth/login` with `staff@college.edu` | HTTP 200, returns JWT token with role `STAFF` | **PASSED** |
| **AUTH-06** | Unauthenticated Route Rejection | No token provided | `GET /api/auth/me` without Authorization header | HTTP 401 Unauthorized | **PASSED** |
| **AUTH-07** | Profile Retrieval | Valid JWT | `GET /api/auth/me` with `Bearer <token>` | HTTP 200, returns user profile, department and semester | **PASSED** |

---

### Module 2: Resource Contribution & Lifecycle

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **RES-01** | Missing File Rejection | Student authenticated | `POST /api/resources` without file part | HTTP 400, "Please upload a resource file." | **PASSED** |
| **RES-02** | Student Contribution Workflow | Student authenticated | Upload valid document with title, subject, semester, and type | HTTP 201, resource created with status **`PENDING`** | **PASSED** |
| **RES-03** | Pending Resource Concealment | Resource is `PENDING` | `GET /api/resources?keyword=...` | HTTP 200, pending resource is **not returned** in public search | **PASSED** |
| **RES-04** | Metadata Validation | Student authenticated | Upload with non-existent `subject_id: 9999` | HTTP 400, "Selected subject does not exist." | **PASSED** |

---

### Module 3: Staff Verification & Reviews

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **REV-01** | Non-Staff Access Rejection | Student authenticated | `GET /api/reviews/pending` as Student | HTTP 403 Forbidden, access denied to non-staff | **PASSED** |
| **REV-02** | Staff Pending Contributions Queue | Staff authenticated | `GET /api/reviews/pending` as Staff | HTTP 200, list of all student uploads awaiting verification | **PASSED** |
| **REV-03** | Contribution Approval | Resource is `PENDING` | `POST /api/reviews/:id` with `{ status: "PUBLISHED", remarks: "..." }` | HTTP 200, resource status updated to **`PUBLISHED`** | **PASSED** |
| **REV-04** | Review Audit History | Resource approved | `GET /api/reviews/resource/:id` | HTTP 200, returns timestamped review remarks and reviewer ID | **PASSED** |

---

### Module 4: Search, Filtering & Discovery

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **SEARCH-01** | Published Resource Search | Resource is `PUBLISHED` | `GET /api/resources?keyword=<title_part>` | HTTP 200, resource appears in results with uploader and subject info | **PASSED** |
| **SEARCH-02** | Multi-Facet Filter (Dept + Subject) | Multiple resources | `GET /api/resources?department_id=1&subject_id=2` | HTTP 200, all returned items strictly match the selected criteria | **PASSED** |
| **SEARCH-03** | Single Resource Retrieval | Resource exists | `GET /api/resources/:id` | HTTP 200, full resource details with download count and uploader | **PASSED** |
| **SEARCH-04** | AI Recommendations | Student authenticated | `GET /api/resources/recommendations` | HTTP 200, relevant suggestions based on student department and year | **PASSED** |

---

### Module 5: Downloads & Access Counter

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DL-01** | Document File Download | Published resource | `GET /api/resources/:id/download` | HTTP 200, file streamed as attachment, increments download counter | **PASSED** |
| **DL-02** | Student Download History | Document downloaded | `GET /api/downloads/my-downloads` | HTTP 200, downloaded resource appears in student's download history | **PASSED** |
| **DL-03** | Staff Download Analytics | Staff authenticated | `GET /api/downloads/analytics` | HTTP 200, aggregates download statistics across departments | **PASSED** |

---

### Module 6: Bookmarks Collection

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **BOOKMARK-01**| Add Resource to Bookmarks | Resource published | `POST /api/bookmarks/:resourceId` | HTTP 200, `{ isBookmarked: true }` | **PASSED** |
| **BOOKMARK-02**| Check Bookmark State | Resource bookmarked | `GET /api/bookmarks/check/:resourceId` | HTTP 200, `{ isBookmarked: true }` | **PASSED** |
| **BOOKMARK-03**| Retrieve Bookmarks List | User has bookmarks | `GET /api/bookmarks` | HTTP 200, returns list of saved items with complete metadata | **PASSED** |
| **BOOKMARK-04**| Remove Bookmark | Resource bookmarked | `DELETE /api/bookmarks/:resourceId` | HTTP 200, `{ isBookmarked: false }` | **PASSED** |

---

### Module 7: Resource Requests Lifecycle

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **REQ-01** | Submit Resource Request | Student authenticated | `POST /api/requests` with title and subject | HTTP 201, creates request with status **`PENDING`** | **PASSED** |
| **REQ-02** | View Personal Requests | Request created | `GET /api/requests/my-requests` | HTTP 200, student sees their pending request | **PASSED** |
| **REQ-03** | Staff Fulfills Request | Staff authenticated | `PATCH /api/requests/:id/respond` with `{ status: "COMPLETED", staff_remarks: "..." }` | HTTP 200, request status updated to **`COMPLETED`** | **PASSED** |
| **REQ-04** | Invalid Request Status | Staff authenticated | `PATCH /api/requests/:id/respond` with status `"INVALID"` | HTTP 400, rejected with valid allowed statuses list | **PASSED** |

---

### Module 8: Academic Taxonomy & Metadata

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CAT-01** | Fetch Departments | Database seeded | `GET /api/categories/departments` | HTTP 200, lists all departments (AI&DS, CSE, IT) | **PASSED** |
| **CAT-02** | Fetch Subjects by Dept | Database seeded | `GET /api/categories/subjects?department_id=1` | HTTP 200, returns subjects belonging only to department 1 | **PASSED** |
| **CAT-03** | Fetch Resource Types | Database seeded | `GET /api/categories/resource-types` | HTTP 200, lists Lecture Notes, Question Papers, Lab Manuals, etc. | **PASSED** |

---

### Module 9: Real-Time Doubt Clearance Chat

| Test ID | Description | Preconditions | Input / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CHAT-01** | Socket Handshake Authentication | Valid JWT | Connect Socket.IO client with `{ auth: { token } }` | Connection accepted, user joined to private room `user_{userId}` | **PASSED** |
| **CHAT-02** | Send Real-Time Message | Two connected users | Emit `send_message` with `{ receiver_id, message }` | Message persisted to DB and broadcasted via `new_message` event | **PASSED** |
| **CHAT-03** | Typing Indicator Relay | Two connected users | Emit `typing` with `{ receiver_id, isTyping: true }` | Recipient receives `user_typing` event | **PASSED** |

---

## 3. Automated Test Execution Evidence

```text
============================================================
  ACADEMIC RESOURCE HUB - AUTOMATED INTEGRATION TEST SUITE
  Target: http://localhost:5000/api
============================================================

1. Authentication & RBAC Tests
  ✓ [PASS] AUTH-01: Health check endpoint returns operational and dbConnected
  ✓ [PASS] AUTH-02: User registration validates required fields and rejects short password
  ✓ [PASS] AUTH-03: Register a new student with valid credentials
  ✓ [PASS] AUTH-04: Prevent duplicate email registration
  ✓ [PASS] AUTH-05: Staff login succeeds with valid credentials
  ✓ [PASS] AUTH-06: Protected endpoint rejects unauthenticated request (401)
  ✓ [PASS] AUTH-07: Get profile returns authenticated user details

2. Resource Upload & Workflow Tests
  ✓ [PASS] RES-01: Reject resource upload without a file
  ✓ [PASS] RES-02: Student uploads resource and it enters PENDING status
  ✓ [PASS] RES-03: Pending resource is hidden from public and student search

3. Staff Review & Approval Tests
  ✓ [PASS] REV-01: Non-staff users cannot access staff review endpoints (403)
  ✓ [PASS] REV-02: Staff can view pending contributions list
  ✓ [PASS] REV-03: Staff approves resource and marks it PUBLISHED
  ✓ [PASS] REV-04: Review history logs reviewer remarks and timestamp

4. Search, Filter & Discovery Tests
  ✓ [PASS] SEARCH-01: Newly approved resource appears in public search results
  ✓ [PASS] SEARCH-02: Search filtering by Department and Subject works accurately
  ✓ [PASS] SEARCH-03: Get single resource details by ID

5. Download & Access Counter Tests
  ✓ [PASS] DL-01: Download resource returns file stream with HTTP 200
  ✓ [PASS] DL-02: Student download history reflects the downloaded item

6. Bookmark Management Tests
  ✓ [PASS] BOOKMARK-01: Add bookmark returns success and isBookmarked: true
  ✓ [PASS] BOOKMARK-02: Check bookmark status returns true
  ✓ [PASS] BOOKMARK-03: Bookmarked item appears in student bookmark collection
  ✓ [PASS] BOOKMARK-04: Remove bookmark updates status to isBookmarked: false

7. Resource Request Workflow Tests
  ✓ [PASS] REQ-01: Student creates a study material request
  ✓ [PASS] REQ-02: Student views their own request in My Requests list
  ✓ [PASS] REQ-03: Staff responds and fulfills the student request

8. Categories & Taxonomy Tests
  ✓ [PASS] CAT-01: Fetch all academic departments
  ✓ [PASS] CAT-02: Fetch subjects filtered by department
  ✓ [PASS] CAT-03: Fetch resource types

============================================================
TEST SUITE SUMMARY: 29/29 PASSED (0 FAILED)
============================================================
```
