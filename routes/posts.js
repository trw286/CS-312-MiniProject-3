// variables and file setup
const express = require('express');
const router = express.Router();
const db = require('../models/db');

/*
************************
****** FUNCTIONS *******
************************
*/

// require login function for actions that require an account
// (new post, edit post, delete post)
function requireLogin(req, res, next) 
{
	// user not logged in
	if (!req.session.user) {
		return res.redirect('/auth/signin');
	}

	// continue
	next();
}

// post ownership check function 
// (creator === current user)
function isOwner(row, req) {
	return row && req.session.user && row.creator_user_id === req.session.user.user_id;
}


/*
************************
***** HTTP METHODS *****
************************
*/

// list all posts
router.get('/', async (req, res, next) => {

	try {

		// SQL query
		const { rows: posts } = await db.query(
		`SELECT blog_id, creator_name, creator_user_id, title, body, date_created
		FROM blogs
		ORDER BY date_created DESC, blog_id DESC`
		);

		// render index.ejs
		res.render('posts/index', { title: 'Blog Feed', posts });
	}
	
	// error handling
	catch (error) { next(error); }
});

// show new post form
router.get('/new', requireLogin, (req, res) => {

	// render new.ejs
	res.render('posts/new', { title: 'New Post' });
});

// create a post (login required)
router.post('/', requireLogin, async (req, res, next) => {
  
	try {

		// get post and user information
    	const { title, body } = req.body;
    	const { user_id, name } = req.session.user;

    	// error handling
    	if (!title || !body) {
			
			return res.status(400).send('Title and body are required.');
		}

		// SQL query
		await db.query(
		`INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created, updated_at, is_published)
		VALUES ($1, $2, $3, $4, NOW(), NOW(), TRUE)`,
		[name, user_id, title, body]
		);

		// redirect back to post page
		res.redirect('/posts');
	} 
	
	// error handling
	catch (error) { next(error); }
});

// edit post page
router.get('/:id/edit', requireLogin, async (req, res, next) => {

	try {

		// SQL query to get post
		const { rows } = await db.query(`SELECT * FROM blogs WHERE blog_id = $1`, [req.params.id]);
		const post = rows[0];

		// error handling
		if (!post) {

			return res.status(404).send('Post not found.');
		}

		// editing error handling
		if (post.creator_user_id !== req.session.user.user_id) {

			return res.status(403).send('Not allowed to edit this post.');
		}
		
		// render edit.ejs
		res.render('posts/edit', { title: `Edit: ${post.title}`, post });
	} 
	
	// error handling
	catch (error) { next(error); }
});

// save post edit
router.put('/:id', requireLogin, async (req, res, next) => {
	
	try {
    
		// SQL query to get post
		const { rows } = await db.query(
		`SELECT blog_id, creator_user_id FROM blogs WHERE blog_id = $1`,
		[req.params.id]
    );

    	const existing = rows[0];

		// errpr handling
    	if (!existing) {

			return res.status(404).send('Post not found.');
		}

    	if (!isOwner(existing, req)) {

			return res.status(403).send('Not allowed.');
		}


    const { title, body } = req.body;

	// SQL query to save
    await db.query(
      `UPDATE blogs SET title = $1, body = $2, updated_at = NOW() WHERE blog_id = $3`,
      [title, body, req.params.id]
    );

	// redirect to post page
    res.redirect('/posts');
  	} 
  
  	// error handling
	catch (error) { next(error); }
});

// delete post
router.delete('/:id', requireLogin, async (req, res, next) => {
	try {

		// ownership check
		const { rows } = await db.query(
		`SELECT blog_id, creator_user_id FROM blogs WHERE blog_id = $1`,
		[req.params.id]
		);

		const post = rows[0];

		// error handling
		if (!post) {

			return res.status(404).send('Post not found.');
		}

		if (post.creator_user_id !== req.session.user.user_id) {

			return res.status(403).send('Not allowed.');
		}

	// SQL delete query
	await db.query(`DELETE FROM blogs WHERE blog_id = $1`, [req.params.id]);

	// redirect to post page
	res.redirect('/posts');
	} 

	// error handling
	catch (error) { next(error); }
});

// directly export router to mount
module.exports = router;