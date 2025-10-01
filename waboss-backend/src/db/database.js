const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // For Dokku / production (single URL)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
} else {
  // For local development (use .env individual vars)
  pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

async function initDb() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database.');

    // --- your schema creation logic stays the same ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        whatsapp_phone TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS temp_whatsapp_links (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sid TEXT NOT NULL,
        phone TEXT NOT NULL,
        token TEXT,
        qrstring TEXT,
        qrimagelink TEXT,
        infolink TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_phone UNIQUE (user_id, phone)
      )
    `);

    await client.query(`
      DELETE FROM temp_whatsapp_links
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sid TEXT NOT NULL,
        phone TEXT NOT NULL,
        unique_id TEXT,
        token TEXT,
        qrstring TEXT,
        qrimagelink TEXT,
        infolink TEXT,
        status TEXT CHECK(status IN ('connected', 'disconnected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { rows } = await client.query(`
      SELECT id, phone FROM whatsapp_accounts WHERE unique_id IS NULL
    `);

    if (rows.length > 0) {
      await populateUniqueIds(rows);
    }
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function populateUniqueIds(rows) {
  try {
    const response = await axios.get('https://maxyprime.com/api/get/wa.accounts', {
      params: {
        secret: process.env.MAXYPRIME_API_SECRET,
        limit: 10000,
      },
    });

    if (response.data.status !== 200) {
      console.error('Failed to fetch wa.accounts:', response.data.message);
      return;
    }

    const accounts = response.data.data;
    const client = await pool.connect();
    try {
      for (const row of rows) {
        const account = accounts.find((acc) => acc.phone === row.phone);
        if (account && account.unique) {
          await client.query(
            `UPDATE whatsapp_accounts SET unique_id = $1 WHERE id = $2`,
            [account.unique, row.id]
          );
          console.log(`Updated unique_id for phone ${row.phone}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching wa.accounts for unique_id update:', error.message);
  }
}

module.exports = {
  query: async (text, params) => {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  },
  initDb,
};
