-- =============================================================================
-- Academic Resource Sharing Hub - MySQL Database Schema
-- Based on Project Specification (Section 13: Recommended MySQL Database Design)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS academic_resource_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE academic_resource_hub;

-- Disable foreign key checks for clean teardown/recreation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS resource_reviews;
DROP TABLE IF EXISTS resource_downloads;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS resource_requests;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS resource_types;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. DEPARTMENTS TABLE
-- Stores academic departments (e.g., AI&DS, CSE, IT)
-- =============================================================================
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. USERS TABLE
-- Handles student registration/login and staff/admin accounts with RBAC
-- =============================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    department_id INT NULL,
    semester VARCHAR(20) NULL COMMENT 'Current semester for students (e.g. Semester 3)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. SUBJECTS TABLE
-- Academic courses mapped to departments, years, and semesters
-- =============================================================================
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department_id INT NOT NULL,
    year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subjects_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. RESOURCE_TYPES TABLE
-- Categories of academic resources (e.g., Lecture Notes, Question Papers)
-- =============================================================================
CREATE TABLE resource_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. RESOURCES TABLE
-- Central academic repository with verification workflow status:
-- (PENDING, UNDER_REVIEW, VERIFIED, PUBLISHED, REJECTED, ARCHIVED)
-- =============================================================================
CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    subject_id INT NOT NULL,
    resource_type_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'PUBLISHED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resources_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_resources_type
        FOREIGN KEY (resource_type_id) REFERENCES resource_types(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_resources_uploader
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. RESOURCE_REQUESTS TABLE
-- Tracks student requests for unavailable resources and staff responses
-- =============================================================================
CREATE TABLE resource_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'COMPLETED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    staff_remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_student
        FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_requests_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. BOOKMARKS TABLE
-- Allows students to save frequently referenced resources
-- =============================================================================
CREATE TABLE bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    resource_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_resource_bookmark UNIQUE (student_id, resource_id),
    CONSTRAINT fk_bookmarks_student
        FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_bookmarks_resource
        FOREIGN KEY (resource_id) REFERENCES resources(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. RESOURCE_DOWNLOADS TABLE
-- Tracks resource download logs for platform statistics and metrics
-- =============================================================================
CREATE TABLE resource_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    resource_id INT NOT NULL,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_downloads_student
        FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_downloads_resource
        FOREIGN KEY (resource_id) REFERENCES resources(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 9. RESOURCE_REVIEWS TABLE
-- Stores staff verification reviews, approval/rejection decisions, and remarks
-- =============================================================================
CREATE TABLE resource_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    staff_id INT NOT NULL,
    status ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'PUBLISHED', 'REJECTED', 'ARCHIVED') NOT NULL,
    remarks TEXT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_resource
        FOREIGN KEY (resource_id) REFERENCES resources(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_staff
        FOREIGN KEY (staff_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 10. CHAT_MESSAGES TABLE
-- Real-time chat messages between students and faculty for doubt clearance
-- =============================================================================
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_chat_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- PERFORMANCE INDEXES
-- Optimized for search, filtering, and role-based dashboards
-- =============================================================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_semester ON users(semester);
CREATE INDEX idx_subjects_department ON subjects(department_id);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_subject ON resources(subject_id);
CREATE INDEX idx_resources_type ON resources(resource_type_id);
CREATE INDEX idx_resources_uploader ON resources(uploaded_by);
CREATE INDEX idx_resources_academic_year ON resources(academic_year);
CREATE INDEX idx_resource_requests_student ON resource_requests(student_id);
CREATE INDEX idx_resource_requests_status ON resource_requests(status);
CREATE INDEX idx_resource_reviews_resource ON resource_reviews(resource_id);
CREATE INDEX idx_resource_reviews_staff ON resource_reviews(staff_id);
CREATE INDEX idx_chat_participants ON chat_messages(sender_id, receiver_id);
CREATE INDEX idx_chat_created_at ON chat_messages(created_at);

-- =============================================================================
-- SEED DATA
-- Default data: 3 Departments, 1 Staff User, 1 Student User, Subjects, Resource Types
-- Note: Password for both users is 'Password@123' (bcrypt hash)
-- =============================================================================

-- Departments
INSERT INTO departments (id, name) VALUES
(1, 'Artificial Intelligence & Data Science'),
(2, 'Computer Science & Engineering'),
(3, 'Information Technology');

-- Users
-- Password hash generated for: 'Password@123'
INSERT INTO users (id, name, email, password_hash, role, department_id, semester) VALUES
(1, 'Dr. Sarah Jenkins', 'staff@college.edu', '$2b$10$vbwVBH.4MQXcFGzZrEuNZezYxAWZVpFf8mAwRCtnej4WsJ9.sfSlm', 'STAFF', 1, NULL),
(2, 'Alex Rivera', 'student@college.edu', '$2b$10$vbwVBH.4MQXcFGzZrEuNZezYxAWZVpFf8mAwRCtnej4WsJ9.sfSlm', 'STUDENT', 1, 'Semester 3');

-- Resource Types (as specified in Section 5 of the specification)
INSERT INTO resource_types (id, name) VALUES
(1, 'Lecture Notes'),
(2, 'Study Materials'),
(3, 'PowerPoint Presentations'),
(4, 'Previous-Year Question Papers'),
(5, 'Question Banks'),
(6, 'Laboratory Manuals'),
(7, 'Syllabus and Course Documents'),
(8, 'Project Guidelines');

-- Subjects
INSERT INTO subjects (id, name, department_id, year, semester) VALUES
-- AI & DS (Department 1)
(1, 'Database Management Systems', 1, 'II Year', 'Semester 3'),
(2, 'Data Structures and Algorithms', 1, 'II Year', 'Semester 3'),
(3, 'Machine Learning Fundamentals', 1, 'III Year', 'Semester 5'),
(4, 'Artificial Intelligence Principles', 1, 'III Year', 'Semester 6'),

-- CSE (Department 2)
(5, 'Operating Systems', 2, 'II Year', 'Semester 4'),
(6, 'Computer Networks', 2, 'III Year', 'Semester 5'),
(7, 'Design and Analysis of Algorithms', 2, 'II Year', 'Semester 3'),

-- IT (Department 3)
(8, 'Web Technologies', 3, 'II Year', 'Semester 4'),
(9, 'Cloud Computing', 3, 'IV Year', 'Semester 7'),
(10, 'Information Security', 3, 'III Year', 'Semester 6');
