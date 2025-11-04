/*
* Process: shared PostgreSQL database connection pool
*/

// variables and file setup

    // load database
require('dotenv').config();
    
    // PostgreSQL client for node
const { Pool } = require('pg');

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
