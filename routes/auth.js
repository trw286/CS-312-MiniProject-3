// variables and file setup
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const router = express.Router();

/*
************************
***** HTTP METHODS *****
************************
*/

// render signup page
router.get('/signup', (req, res) => {

    // render signup.ejs
    res.render('auth/signup', { title: 'Sign Up' });
});

// create user
router.post('/signup', async (req, res, next) => {
    try {

        // get user information
        const { user_id, name, password } = req.body;

        // error check
        if (!user_id || !name || !password) {

            return res.status(400).send('All fields required.');
        }

        // hash the password
        const hash = await bcrypt.hash(password, 10);

        // SQL query to insert new user
        await db.query(
        `INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)`,
        [user_id, hash, name]
        );

        // auto-login
        req.session.user = { user_id, name };

        // redirect to posts page
        res.redirect('/posts');
    } 
    
    // error handling
    catch (error) {

        // handle duplicate user_id
        // 23505 is dup key value
        if (error.code === '23505') {

            return res.status(409).send('User already exists.');
        }

        next(error);
    }
});

// render signin form
router.get('/signin', (req, res) => {

    // render signin.ejs
    res.render('auth/signin', { title: 'Sign In' });
});

// authenticate user
router.post('/signin', async (req, res, next) => {
    
    try {

        // get user information
        const { user_id, password } = req.body;

        // SQL query to check user information
        const { rows } = await db.query(
        `SELECT user_id, password, name FROM users WHERE user_id = $1`,
        [user_id]
        );

        const user = rows[0];

        // erorr handling
        if (!user) {
            return res.status(401).send('Invalid credentials');
        }

        // compare bcrypt hash stored in users.password
        const validComapre = await bcrypt.compare(password, user.password);

        // error handling
        if (!validComapre) {
            return res.status(401).send('Invalid credentials');
        }

        // set session
        req.session.user = { user_id: user.user_id, name: user.name };

        // redirect to posts page
        res.redirect('/posts');
    } 
    
    // error handling
    catch (error) { next(error); }
});

// signout
router.post('/signout', (req, res) => {

    // end session
    req.session.destroy(() => res.redirect('/'));
});

// export router to mount
module.exports = router;
