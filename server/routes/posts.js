// variables and file setup
const express = require('express');
const router = express.Router();
const { pool } = require('../models/db');

/*
************************
****** FUNCTIONS *******
************************
*/

// require login function for actions that require an account
// (new post, edit post, delete post)
function requireAuth(req, res, next) 
{
	// user not logged in
	if (!req.session.user.user_id) {
		return res.status(401).json({error: 'Not authenticated'});
	}

	// continue
	next();
}

/*
***********************************
*********** POST ROUTES ***********
***********************************
*/

// GET /api/posts (list of posts)
router.get('/', async (_req, res) => {

	// get posts from db
	try {
		const {rows} = await pool.query(
			`SELECT blog_id, creator_name, creator_user_id, title, body, date_created
			FROM blogs
			ORDER BY date_created DESC, blog_id DESC`
		);

		// return posts
		res.json({ posts: rows });
	} 
	
	// error handling
	catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/posts/:id (single post)
router.get('/:id', async (req, res) => {
	
	// get post
	try {

		// query
    	const { rows } = await pool.query(
			`SELECT blog_id, creator_name, creator_user_id, title, body, date_created
			FROM blogs
			WHERE blog_id = $1`,
      		[req.params.id]
		);

		// check if post found
    	if (!rows.length) {
			return res.status(404).json({ error: 'Post not found' });
		}

		// render post
    	res.json({ post: rows[0] });
  	}
	
	// error handling
	catch (error) {
    	console.error('GET /api/posts/:id error:', error);
    	res.status(500).json({ error: 'Server error' });
  	}
});

// POST /api/posts (create post)
router.post('/', requireAuth, async (req, res) => {

	// get post contents
  	try {
    	const { title, body } = req.body || {};
    	
		// validate contents
    	if (typeof title !== 'string' || typeof body !== 'string' || !title.trim() || !body.trim()) {
      		return res.status(400).json({ error: 'Missing required fields' });
    	}

    	// get user information and validate
    	const { user_id, name } = req.session.user || {};
    	if (!user_id) {
			return res.status(401).json({ error: 'Not authenticated' });
		}

		// query
    	await pool.query(
			`INSERT INTO blogs (creator_user_id, creator_name, title, body, date_created)
			VALUES ($1, $2, $3, $4, NOW())`,
      		[req.session.user.user_id, req.session.user.name, title, body]
    	);

		// display success
    	res.status(201).json({ message: 'Post created successfully.' });
  	} 
	
	// error handling
	catch (error) {
    	console.error('POST /api/posts error:', error);
    	res.status(500).json({ error: 'Server error' });
  	}
});


// PUT /api/posts/:id (edit post)
router.put('/:id', requireAuth, async (req, res) => {

	// update post in db
	try {
		const { title, body } = req.body;
		if (!title || !body) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		// check for post and ownership
		const existing = await pool.query(
			`SELECT creator_user_id FROM blogs WHERE blog_id = $1`,
			[req.params.id]
		);

		if (!existing.rowCount) {
			return res.status(404).json({ error: 'Post not found' });
		}

		if (existing.rows[0].creator_user_id !== req.session.user.user_id) {
			return res.status(403).json({ error: 'Not owner.' });
		}

		// query
		await pool.query(
			`UPDATE blogs
			SET title = $1, body = $2
			WHERE blog_id = $3`,
			[title, body, req.params.id]
		);

		// return success message
		res.json({ message: 'Post updated successfully.' });
	} 
	
	// error handling
	catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server error' });
	}
});

// DELETE /api/posts/:id (delete post)
router.delete('/:id', requireAuth, async (req, res) => {

	// delete post from db
	try {
		const existing = await pool.query(
			`SELECT creator_user_id FROM blogs WHERE blog_id = $1`,
			[req.params.id]
		);

		if (!existing.rowCount) {
			return res.status(404).json({ error: 'Post not found' });
		}

		if (existing.rows[0].creator_user_id !== req.session.user.user_id) {
			return res.status(403).json({ error: 'Not owner.' });
		}
		
		// query
		await pool.query(
			`DELETE FROM blogs WHERE blog_id = $1`,
			[req.params.id]
		);

		// return success message
		res.json({ message: 'Post deleted successfully.' });
	} 

	// error handling
	catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server error' });
	}
});

// directly export router to mount
module.exports = router;