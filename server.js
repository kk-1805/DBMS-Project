const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection Pool Configuration
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'KKkshitiz1893$@',
    database: 'conference_db',
    waitForConnections: true,
    connectionLimit: 10
});

// Test connection on boot
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('Connected to local MySQL database: conference_db');
        conn.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

// Fetch all portal data
app.get('/api/data', async (req, res) => {
    try {
        const [participants] = await pool.query(
            'SELECT * FROM participants ORDER BY participant_id DESC'
        );

        const [sessions] = await pool.query(
            'SELECT * FROM sessions ORDER BY session_date ASC, start_time ASC'
        );

        const [papers] = await pool.query(`
            SELECT 
                p.paper_id, p.title, p.research_track, p.abstract, p.status,
                u.full_name AS author_name, u.affiliation AS author_affiliation,
                s.session_title, s.room_no, s.session_date, s.start_time
            FROM papers p
            JOIN participants u ON p.author_id = u.participant_id
            LEFT JOIN sessions s ON p.session_id = s.session_id
            ORDER BY p.paper_id DESC
        `);

        const [reviews] = await pool.query(`
            SELECT 
                r.review_id, r.score, r.comments, r.decision,
                p.title AS paper_title,
                u.full_name AS reviewer_name
            FROM reviews r
            JOIN papers p ON r.paper_id = p.paper_id
            JOIN participants u ON r.reviewer_id = u.participant_id
            ORDER BY r.review_id DESC
        `);

        const [certificates] = await pool.query(`
            SELECT 
                c.certificate_id, c.certificate_type, c.issue_date, c.certificate_code,
                u.full_name, u.affiliation, u.role
            FROM certificates c
            JOIN participants u ON c.participant_id = u.participant_id
            ORDER BY c.certificate_id DESC
        `);

        res.json({ participants, sessions, papers, reviews, certificates });
    } catch (err) {
        console.error('Data fetch error:', err);
        res.status(500).json({ error: 'Failed to retrieve conference records.' });
    }
});

// 1. Register Participant (Author, Reviewer, Attendee)
app.post('/api/participants', async (req, res) => {
    const { full_name, email, affiliation, role } = req.body;
    try {
        await pool.query(
            'INSERT INTO participants (full_name, email, affiliation, role) VALUES (?, ?, ?, ?)',
            [full_name, email, affiliation, role]
        );
        res.status(201).json({ message: 'Participant registered successfully.' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Email already exists or invalid participant details.' });
    }
});

// 2. Submit Research Paper
app.post('/api/papers', async (req, res) => {
    const { title, research_track, abstract, author_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO papers (title, research_track, abstract, author_id) VALUES (?, ?, ?, ?)',
            [title, research_track, abstract, author_id]
        );
        res.status(201).json({ message: 'Research paper submitted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Could not submit research paper.' });
    }
});

// 3. Create Presentation Session
app.post('/api/sessions', async (req, res) => {
    const { session_title, room_no, session_date, start_time } = req.body;
    try {
        await pool.query(
            'INSERT INTO sessions (session_title, room_no, session_date, start_time) VALUES (?, ?, ?, ?)',
            [session_title, room_no, session_date, start_time]
        );
        res.status(201).json({ message: 'Presentation session added.' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Failed to schedule session.' });
    }
});

// 4. Reviewer Evaluation & Session Assignment
app.post('/api/reviews', async (req, res) => {
    const { paper_id, reviewer_id, score, comments, decision, session_id } = req.body;
    const newStatus = decision === 'Accept' ? 'Accepted' : 'Rejected';
    const assignedSession = decision === 'Accept' && session_id ? session_id : null;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            'INSERT INTO reviews (paper_id, reviewer_id, score, comments, decision) VALUES (?, ?, ?, ?, ?)',
            [paper_id, reviewer_id, score, comments, decision]
        );

        await conn.query(
            'UPDATE papers SET status = ?, session_id = ? WHERE paper_id = ?',
            [newStatus, assignedSession, paper_id]
        );

        await conn.commit();
        res.status(201).json({ message: 'Evaluation recorded and paper status updated.' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(400).json({ error: 'Failed to submit evaluation.' });
    } finally {
        conn.release();
    }
});

// 5. Issue Conference Certificate
app.post('/api/certificates', async (req, res) => {
    const { participant_id, certificate_type } = req.body;
    const issue_date = new Date().toISOString().split('T')[0];
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const certificate_code = `IRC-${new Date().getFullYear()}-${randomHex}`;

    try {
        await pool.query(
            'INSERT INTO certificates (participant_id, certificate_type, issue_date, certificate_code) VALUES (?, ?, ?, ?)',
            [participant_id, certificate_type, issue_date, certificate_code]
        );
        res.status(201).json({ message: 'Certificate issued successfully.', certificate_code });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Failed to issue certificate.' });
    }
});

app.listen(PORT, () => {
    console.log(`Conference Management Portal running at http://localhost:${PORT}`);
});
