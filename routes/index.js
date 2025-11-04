// variables and file setup
const express = require('express');
const router = express.Router();
const db = require('../models/db'); // import PostgreSQL database

/*
************************
***** HTTP METHODS *****
************************
*/

// home page
router.get('/', async (req, res, next) => {

  try {

    // SQL query to get posts
    const { rows: posts } = await db.query(
      `SELECT blog_id, creator_name, creator_user_id, title, body, date_created, updated_at
       FROM blogs
       ORDER BY date_created DESC, blog_id DESC`
    );

    // render index.ejs 
    res.render('posts/index', { title: 'Blog Feed', posts, showCreateForm: false });
  } 
  
  // error handling 
  catch (error) { next(error); }
});

// export router so app.js can mount
module.exports = router;
