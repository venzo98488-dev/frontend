# Academic Resource Sharing Hub - API Documentation

This document provides complete, production-grade technical documentation for all RESTful API endpoints and WebSocket events provided by the Academic Resource Hub backend.

---

## 1. General Specifications

- **Base URL**: `http://localhost:5000/api`
- **Socket Server URL**: `http://localhost:5000`
- **Default Port**: `5000`
- **Data Interchange Format**: JSON (`application/json`) for standard endpoints, `multipart/form-data` for resource file uploads.
- **Character Encoding**: UTF-8

### Authentication Header
Protected endpoints require a JSON Web Token (JWT) passed in the `Authorization` HTTP header:
```http
Authorization: Bearer <jwt_token>
```

### Standard Success Response Format
```json
{
  "message": "Action completed successfully",
  "data": { ... }
}
```

### Standard Error Response Format
```json
{
  "error": "Descriptive human-readable error message"
}
```

### HTTP Status Code Reference
| Code | Meaning | Context |
| :--- | :--- | :--- |
| `200 OK` | Standard Success | Resource retrieved or updated |
| `201 Created` | Creation Success | Resource, user, or request created |
| `400 Bad Request` | Validation Failure | Missing or malformed required parameters |
| `401 Unauthorized` | Authentication Failure | Missing, expired, or invalid JWT token |
| `403 Forbidden` | Authorization Failure | Authenticated user lacks required role (e.g. non-staff accessing reviews) |
| `404 Not Found` | Entity Missing | Requested record does not exist |
| `409 Conflict` | Uniqueness Violation | Email or resource name already exists |
| `500 Server Error` | Internal Exception | Unhandled backend exception or database downtime |

---

## 2. Authentication API (`/api/auth`)

### 2.1 User Registration
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@college.edu",
  "password": "Password@123",
  "role": "STUDENT",
  "department_id": 1,
  "semester": "Semester 3"
}
```
- **Validation Rules**:
  - `name`: Required non-empty string.
  - `email`: Required valid email syntax, checked for uniqueness.
  - `password`: Minimum 6 characters.
  - `role`: Optional (`STUDENT`, `STAFF`, `ADMIN`). Defaults to `STUDENT`.
  - `department_id`: Optional integer referencing `departments.id`.
  - `semester`: Optional string (only persisted if role is `STUDENT`).
- **Success Response (`201 Created`)**:
```json
{
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 7,
    "name": "Jane Doe",
    "email": "jane@college.edu",
    "role": "STUDENT",
    "department_id": 1,
    "semester": "Semester 3"
  }
}
```

### 2.2 User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "staff@college.edu",
  "password": "Password@123"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dr. Sarah Jenkins",
    "email": "staff@college.edu",
    "role": "STAFF",
    "department_id": 1,
    "semester": null,
    "department_name": "Artificial Intelligence & Data Science",
    "created_at": "2026-10-17T14:00:00.000Z"
  }
}
```

### 2.3 Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Authenticated (`STUDENT`, `STAFF`, `ADMIN`)
- **Success Response (`200 OK`)**:
```json
{
  "user": {
    "id": 1,
    "name": "Dr. Sarah Jenkins",
    "email": "staff@college.edu",
    "role": "STAFF",
    "department_id": 1,
    "department_name": "Artificial Intelligence & Data Science"
  }
}
```

### 2.4 Update Profile
- **Method**: `PUT`
- **Path**: `/api/auth/profile`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "name": "Dr. Sarah Jenkins, Ph.D.",
  "department_id": 1,
  "semester": null,
  "password": "NewSecurePassword@123"
}
```

---

## 3. Resources API (`/api/resources`)

### 3.1 Browse & Search Resources
- **Method**: `GET`
- **Path**: `/api/resources`
- **Access**: Public / Optional Authenticated (Staff can filter by unapproved status)
- **Query Parameters**:
  - `keyword` (string): Searches title and description.
  - `department_id` (integer): Filter by department.
  - `subject_id` (integer): Filter by subject.
  - `resource_type_id` (integer): Filter by document category (Lecture Notes, Question Banks, etc.).
  - `year` (string): Filter by academic year level (`I Year`, `II Year`, `III Year`, `IV Year`).
  - `semester` (string): Filter by semester (`Semester 1` to `Semester 8`).
  - `academic_year` (string): Filter by session (`2026-27`).
  - `status` (string): Allowed for staff only (`PENDING`, `UNDER_REVIEW`, `PUBLISHED`, `REJECTED`, `ARCHIVED`). For public/students, strictly locked to `PUBLISHED`.
  - `sortBy` (string): `created_at` (default), `title`, `downloads`.
  - `sortOrder` (string): `DESC` (default) or `ASC`.
  - `page` (integer): Page index (default: `1`).
  - `limit` (integer): Items per page (default: `12`).
- **Success Response (`200 OK`)**:
```json
{
  "data": [
    {
      "id": 4,
      "title": "DBMS Complete Revision Notes",
      "description": "Comprehensive notes on Relational Algebra and Normalization.",
      "file_path": "uploads/file-1729175400000.pdf",
      "academic_year": "2026-27",
      "status": "PUBLISHED",
      "subject_id": 1,
      "subject_name": "Database Management Systems",
      "subject_year": "II Year",
      "subject_semester": "Semester 3",
      "department_id": 1,
      "department_name": "Artificial Intelligence & Data Science",
      "resource_type_id": 1,
      "resource_type_name": "Lecture Notes",
      "uploaded_by": 2,
      "uploader_name": "Alex Rivera",
      "uploader_role": "STUDENT",
      "download_count": 14,
      "created_at": "2026-10-17T14:05:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  }
}
```

### 3.2 Upload Resource
- **Method**: `POST`
- **Path**: `/api/resources`
- **Access**: Authenticated
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file` (File, binary): Required document (`.pdf`, `.docx`, `.pptx`, `.txt`, `.zip`). Max 25MB.
  - `title` (string): Required resource title.
  - `description` (string): Optional summary.
  - `subject_id` (integer): Required valid subject ID.
  - `resource_type_id` (integer): Required valid resource type ID.
  - `academic_year` (string): Required academic session (e.g. `2026-27`).
- **Workflow State Behavior**:
  - If uploaded by a **STUDENT**: Initial status is strictly set to **`PENDING`**.
  - If uploaded by **STAFF/ADMIN**: Initial status defaults to **`PUBLISHED`**.
- **Success Response (`201 Created`)**:
```json
{
  "message": "Resource contributed successfully and is currently pending staff review.",
  "resource": {
    "id": 8,
    "title": "Data Structures Trees Revision",
    "status": "PENDING",
    "file_path": "uploads/file-1792245900000.txt"
  }
}
```

### 3.3 Personalized AI Recommendations
- **Method**: `GET`
- **Path**: `/api/resources/recommendations`
- **Access**: Authenticated (`STUDENT`)
- **Description**: Uses behavior signals (student's enrolled department, semester, download logs, and bookmark preferences) to compute personalized content relevance scores.
- **Success Response (`200 OK`)**:
```json
{
  "recommendations": [ ... ],
  "meta": {
    "source": "personalized_ai_algorithm",
    "based_on": {
      "department_id": 1,
      "semester": "Semester 3"
    }
  }
}
```

### 3.4 Download Resource File
- **Method**: `GET`
- **Path**: `/api/resources/:id/download`
- **Access**: Public / Optional Authenticated
- **Description**: Serves the physical file stream as an attachment, automatically creates an audit record in `resource_downloads`, and increments the resource's download count.
- **Headers Returned**:
```http
Content-Disposition: attachment; filename="DBMS_Notes.pdf"
Content-Type: application/pdf
```

---

## 4. Staff Verification & Reviews API (`/api/reviews`)

### 4.1 Get Pending Contributions
- **Method**: `GET`
- **Path**: `/api/reviews/pending`
- **Access**: Restricted to `STAFF` and `ADMIN`
- **Query Parameters**:
  - `status`: `ALL` (default, covers `PENDING` & `UNDER_REVIEW`), `PENDING`, or `UNDER_REVIEW`.
  - `department_id`: Optional filter by department.
- **Success Response (`200 OK`)**:
```json
{
  "pendingContributions": [
    {
      "id": 8,
      "title": "Data Structures Trees Revision",
      "description": "Comprehensive notes on balanced trees.",
      "file_path": "uploads/file-1792245900000.txt",
      "academic_year": "2026-27",
      "status": "PENDING",
      "created_at": "2026-10-17T14:10:00.000Z",
      "subject_name": "Data Structures and Algorithms",
      "department_name": "Artificial Intelligence & Data Science",
      "resource_type_name": "Lecture Notes",
      "student_name": "Alex Rivera",
      "student_email": "student@college.edu"
    }
  ]
}
```

### 4.2 Verify / Approve / Reject Contribution
- **Method**: `POST`
- **Path**: `/api/reviews/:resourceId`
- **Access**: Restricted to `STAFF` and `ADMIN`
- **Request Body**:
```json
{
  "status": "PUBLISHED",
  "remarks": "Verified syllabus compliance and accuracy. Approved for student access."
}
```
- **Allowed Statuses**: `UNDER_REVIEW`, `VERIFIED`, `PUBLISHED`, `REJECTED`.
- **Success Response (`200 OK`)**:
```json
{
  "message": "Resource status updated to PUBLISHED.",
  "resourceId": "8",
  "status": "PUBLISHED",
  "remarks": "Verified syllabus compliance and accuracy. Approved for student access.",
  "reviewerId": 1
}
```

### 4.3 Get Resource Review Audit History
- **Method**: `GET`
- **Path**: `/api/reviews/resource/:resourceId`
- **Access**: Restricted to `STAFF` and `ADMIN`
- **Success Response (`200 OK`)**: Returns ordered array of review decisions and staff remarks.

---

## 5. Bookmarks API (`/api/bookmarks`)

### 5.1 Add Bookmark
- **Method**: `POST`
- **Path**: `/api/bookmarks/:resourceId`
- **Access**: Authenticated (`STUDENT`)
- **Success Response (`200 OK`)**:
```json
{
  "message": "Resource bookmarked successfully.",
  "isBookmarked": true
}
```

### 5.2 Remove Bookmark
- **Method**: `DELETE`
- **Path**: `/api/bookmarks/:resourceId`
- **Access**: Authenticated (`STUDENT`)
- **Success Response (`200 OK`)**:
```json
{
  "message": "Bookmark removed successfully.",
  "isBookmarked": false
}
```

### 5.3 Get Student's Bookmarked Resources
- **Method**: `GET`
- **Path**: `/api/bookmarks`
- **Access**: Authenticated (`STUDENT`)
- **Success Response (`200 OK`)**: Array of bookmarked resources with download counts and metadata.

### 5.4 Check Resource Bookmark Status
- **Method**: `GET`
- **Path**: `/api/bookmarks/check/:resourceId`
- **Access**: Authenticated
- **Success Response (`200 OK`)**:
```json
{
  "isBookmarked": true
}
```

---

## 6. Resource Requests API (`/api/requests`)

### 6.1 Create Resource Request
- **Method**: `POST`
- **Path**: `/api/requests`
- **Access**: Authenticated (`STUDENT`)
- **Request Body**:
```json
{
  "subject_id": 1,
  "title": "Need 2025 End-Semester Solved DBMS Question Papers",
  "description": "Please provide solved papers for Relational Calculus and Transaction Isolation."
}
```
- **Success Response (`201 Created`)**:
```json
{
  "message": "Resource request created successfully.",
  "requestId": 3,
  "status": "PENDING"
}
```

### 6.2 View Student's Requests
- **Method**: `GET`
- **Path**: `/api/requests/my-requests`
- **Access**: Authenticated (`STUDENT`)
- **Success Response (`200 OK`)**: Array of student's active and resolved requests.

### 6.3 View All Requests (Staff Board)
- **Method**: `GET`
- **Path**: `/api/requests`
- **Access**: Restricted to `STAFF` and `ADMIN`
- **Query Parameters**: `status`, `department_id`, `subject_id`.

### 6.4 Respond to Request (Staff / Admin)
- **Method**: `PATCH`
- **Path**: `/api/requests/:id/respond`
- **Access**: Restricted to `STAFF` and `ADMIN`
- **Request Body**:
```json
{
  "status": "COMPLETED",
  "staff_remarks": "Solved question papers uploaded to Lecture Notes section."
}
```
- **Allowed Statuses**: `PENDING`, `UNDER_REVIEW`, `COMPLETED`, `REJECTED`, `CLOSED`.

---

## 7. Doubt Clearance Real-Time Chat API & WebSockets

### 7.1 REST Contacts List
- **Method**: `GET`
- **Path**: `/api/chat/contacts`
- **Access**: Authenticated
- **Description**: Returns all conversable faculty/students along with unread message counts.

### 7.2 REST Conversation History
- **Method**: `GET`
- **Path**: `/api/chat/messages/:contactId`
- **Access**: Authenticated
- **Description**: Returns chronologically ordered messages between the logged-in user and the specified contact.

### 7.3 Socket.io Protocol Specification
- **Connection Handshake**:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: '<jwt_token>' }
});
```

#### Client Emits:
- `send_message`: `{ receiver_id: 1, message: "Hello Professor, could you clarify ACID durability?" }`
- `typing`: `{ receiver_id: 1, isTyping: true }`
- `mark_read`: `{ sender_id: 1 }`

#### Server Emits:
- `new_message`: Delivered to the recipient room `user_{receiver_id}`.
- `message_sent`: Confirmation returned to the sender.
- `user_typing`: Relays typing indicator `{ sender_id, sender_name, isTyping }`.
- `messages_read`: Notifies that previous unread messages were opened.

---

## 8. Taxonomy & Categories API (`/api/categories`)

- `GET /api/categories/departments`: Lists all departments.
- `GET /api/categories/subjects?department_id=1&year=II Year&semester=Semester 3`: Filtered subjects.
- `GET /api/categories/resource-types`: Standard types (Lecture Notes, Question Banks, Lab Manuals, etc.).
- `GET /api/categories/academic-years`: Available academic years (e.g., `2026-27`).
- `POST / PUT / DELETE`: Manage departments, subjects, and resource types (restricted to `STAFF` / `ADMIN`).

---

## 9. Dashboard & Analytics API (`/api/dashboard` & `/api/downloads`)

- `GET /api/dashboard/stats`: Returns role-tailored dashboard metrics:
  - For **STUDENTS**: Total available resources, personal contributions count, bookmarked count, active requests count.
  - For **STAFF**: Total verified resources, pending reviews count, pending requests count, total system downloads.
- `GET /api/downloads/my-downloads`: Student's download timeline.
- `GET /api/downloads/analytics`: Staff system-wide download statistics and most downloaded resources.
