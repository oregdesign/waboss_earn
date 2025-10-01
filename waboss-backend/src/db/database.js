const { Pool } = require('pg');
require('dotenv').config();

let connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString, ssl: { rejectUnauthorized: false } }) // dokku/heroku style
  : new Pool({
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    });

async function initDb() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
}

module.exports = { pool, initDb };
