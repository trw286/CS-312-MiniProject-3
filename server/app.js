// variable and file setup
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const { pool } = require('./models/db');

// server
const app = express();

// middleware
app.use(express.json());

// CORS
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true
}));

// session
app.use(session({
	store: new pgSession({
						   	pool,
							tableName: 'user_sessions',
							createTableIfMissing: true
	}),
	secret: process.env.SESSION_SECRET || 'dev-secret',
	resave: false,
	saveUninitialized: false,
	cookie: { 
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
	}
}));

// health check
app.get('/api/health', (_req, res) => {
	res.json({ ok: true, timestamp: Date.now() });
});

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// port
const port = process.env.PORT || 8000;
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});