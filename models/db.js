/*
* Process: shared PostgreSQL database connection pool
*/

// variables and file setup
    
    // PostgreSQL client for node
const { Pool } = require('pg');

    // load database
require('dotenv').config();

// pool instance
const pool = new Pool({

    // database conenction
    connectionString: process.env.DATABASE_URL,
});

// export helper for parameterized queries
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
