// variable and file setup
const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const session = require('express-session');

// server
const app = express();
const port = 3000;

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// server static files
app.use(express.static(path.join(__dirname, 'public')));

// middleware
app.use(express.urlencoded({ extended: true }));    // parse html
app.use(methodOverride('_method'));                 // HTML methods

app.use(session({
	secret: 'temp-secret', 
	resave: false,				// don't resave if no changes made
	saveUninitialized: true,	// create session for new users
}));

// make currentUser available to all views
app.use((req, res, next) => {
  	res.locals.currentUser = req.session.user || null;
  	next();
});

// routers
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const authRouter  = require('./routes/auth');

// mount routers
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/auth', authRouter);

// 404 error page
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));

// boot server 
app.listen(port, () => console.log(`\n▶ Server running at http://localhost:${port}`));
