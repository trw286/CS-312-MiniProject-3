// variables and file setup
const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../models/db');

const router = express.Router();

/*
************************
****** FUNCTIONS *******
************************
*/

// POST /api/auth/signup
router.post('/signup', async (req, res) => {

    try {
        // get user information and trim inputs
        const user_id = String(req.body.user_id || '').trim();
        const password = String(req.body.password || '');
        const name = String(req.body.name || '').trim();

        // missing required fields
        if (!user_id || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // check for existing user_id
        const exists = await pool.query('SELECT 1 FROM users WHERE user_id = $1', [user_id]);
        if (exists.rowCount) {
            return res.status(409).json({ error: 'User ID already exists.' });
        }

        // hash password and insert user
        const hash = await bcrypt.hash(password, 12);
        await pool.query(
                `INSERT INTO users (user_id, password, name)
                VALUES ($1, $2, $3)`,
                [user_id, hash, name]
        );

        // success
        res.status(201).json({ message: 'Sign-up successful.' });
    }

    // error handling
    catch (error) {
        console.error('POST /api/auth/signup error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/signin  -> authenticate + start session
router.post('/signin', async (req, res) => {
    try {
        // sanitize inputs
        const user_id = String(req.body.user_id || '').trim();
        const password = String(req.body.password || '');

        // missing required fields
        if (!user_id || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // get user and verify password
        const result = await pool.query(
            `SELECT user_id, name, password
             FROM users
             WHERE user_id = $1`,
            [user_id]
        );

        // user not found
        if (!result.rowCount) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // set session (store minimal safe fields)
        req.session.user = { user_id: user.user_id, name: user.name };

        // success
        res.json({ message: 'Sign-in successful.', user: req.session.user });
    }
    catch (error) {
        console.error('POST /api/auth/signin error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/signout -> destroy session cookie
router.post('/signout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Sign-out successful.' });
    });
});

// GET /api/auth/me -> return current session user (or null)
router.get('/me', (req, res) => {
    res.json({ user: req.session.user || null });
});

// directly export router to mount
module.exports = router;
