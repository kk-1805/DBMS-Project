CREATE DATABASE IF NOT EXISTS conference_db;
USE conference_db;

-- 1. Participants Table (Authors, Reviewers, Attendees)
CREATE TABLE IF NOT EXISTS participants (
    participant_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    affiliation VARCHAR(150) NOT NULL,
    role ENUM('Author', 'Reviewer', 'Attendee') NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Presentation Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    session_title VARCHAR(150) NOT NULL,
    room_no VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL
);

-- 3. Research Papers Table
CREATE TABLE IF NOT EXISTS papers (
    paper_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    research_track VARCHAR(100) NOT NULL,
    abstract TEXT NOT NULL,
    author_id INT NOT NULL,
    status ENUM('Submitted', 'Accepted', 'Rejected') DEFAULT 'Submitted',
    session_id INT DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES participants(participant_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL
);

-- 4. Peer Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    paper_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 10),
    comments TEXT,
    decision ENUM('Accept', 'Reject') NOT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(paper_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES participants(participant_id) ON DELETE CASCADE
);

-- 5. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    certificate_id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    certificate_type ENUM('Paper Presentation', 'Peer Review Committee', 'Conference Participation') NOT NULL,
    issue_date DATE NOT NULL,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
);

-- Seed Data for Presentation Sessions
INSERT INTO sessions (session_title, room_no, session_date, start_time)
SELECT 'Track A: Artificial Intelligence & Machine Learning', 'Main Auditorium', '2026-11-18', '09:30:00'
WHERE NOT EXISTS (SELECT 1 FROM sessions WHERE session_title LIKE 'Track A%');

INSERT INTO sessions (session_title, room_no, session_date, start_time)
SELECT 'Track B: Control Systems & Robotics', 'Seminar Hall 201', '2026-11-18', '11:30:00'
WHERE NOT EXISTS (SELECT 1 FROM sessions WHERE session_title LIKE 'Track B%');

INSERT INTO sessions (session_title, room_no, session_date, start_time)
SELECT 'Track C: Data Science & Cloud Computing', 'Conference Room 104', '2026-11-19', '10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM sessions WHERE session_title LIKE 'Track C%');

INSERT INTO sessions (session_title, room_no, session_date, start_time)
SELECT 'Track D: Sustainable Energy & Smart Grids', 'Lecture Hall 302', '2026-11-19', '14:00:00'
WHERE NOT EXISTS (SELECT 1 FROM sessions WHERE session_title LIKE 'Track D%');

-- Seed Starter Participants for Instant Testing
INSERT INTO participants (full_name, email, affiliation, role)
SELECT 'Dr. Alan Turing', 'a.turing@cambridge.edu', 'Department of Computer Science', 'Author'
WHERE NOT EXISTS (SELECT 1 FROM participants WHERE email = 'a.turing@cambridge.edu');

INSERT INTO participants (full_name, email, affiliation, role)
SELECT 'Prof. Grace Hopper', 'g.hopper@yale.edu', 'Institute of Computing & Systems', 'Reviewer'
WHERE NOT EXISTS (SELECT 1 FROM participants WHERE email = 'g.hopper@yale.edu');

INSERT INTO participants (full_name, email, affiliation, role)
SELECT 'Dr. Katherine Johnson', 'k.johnson@aerospace.org', 'Orbital Mechanics Research Council', 'Attendee'
WHERE NOT EXISTS (SELECT 1 FROM participants WHERE email = 'k.johnson@aerospace.org');

-- Seed Starter Research Paper
INSERT INTO papers (title, research_track, abstract, author_id, status)
SELECT 'Deep Learning Architectures for Autonomous Drone Navigation', 'Artificial Intelligence & ML', 'This paper introduces low-power edge neural networks capable of real-time obstacle avoidance and path planning in GPS-denied environments.', 1, 'Submitted'
WHERE NOT EXISTS (SELECT 1 FROM papers WHERE title LIKE 'Deep Learning Architectures%');
