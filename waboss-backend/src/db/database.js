const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 20,  // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function initDb() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database.');

    // Optional: Drop tables for schema reset (uncomment for dev if needed)
    // await client.query('DROP TABLE IF EXISTS temp_whatsapp_links CASCADE');
    // await client.query('DROP TABLE IF EXISTS whatsapp_accounts CASCADE');
    // await client.query('DROP TABLE IF EXISTS users CASCADE');

    // Create users table (added whatsapp_phone to match CSV/schema)
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
    console.log('Users table created or already exists.');

    // Create temp_whatsapp_links table
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
    console.log('Temp WhatsApp links table created or already exists (with unique constraint).');

    // Clean up old temp_whatsapp_links records (older than 24 hours)
    await client.query(`
      DELETE FROM temp_whatsapp_links
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `);
    console.log('Cleaned up old temp_whatsapp_links records.');

    // Create whatsapp_accounts table
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
    console.log('WhatsApp accounts table created or already exists.');

    // Populate unique_id for existing whatsapp_accounts records (adapted to async/PG)
    const { rows } = await client.query(`
      SELECT id, phone FROM whatsapp_accounts WHERE unique_id IS NULL
    `);

    if (rows.length === 0) {
      console.log('No whatsapp_accounts records need unique_id update.');
    } else {
      await populateUniqueIds(rows);
    }
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;  // Rethrow to handle in index.js
  } finally {
    client.release();
  }
}

// Function to populate unique_id for existing whatsapp_accounts records
async function populateUniqueIds(rows) {
  try {
    const response = await axios.get('https://maxyprime.com/api/get/wa.accounts', {
      params: {
        secret: process.env.MAXYPRIME_API_SECRET,
        limit: 10000,
      },
    });

    if (response.data.status !== 200) {
      console.error('Failed to fetch wa.accounts for unique_id update:', response.data.message);
      return;
    }

    const accounts = response.data.data;
    const client = await pool.connect();
    try {
      for (const row of rows) {
        const account = accounts.find((acc) => acc.phone === row.phone);
        if (account && account.unique) {
          await client.query(`
            UPDATE whatsapp_accounts SET unique_id = $1 WHERE id = $2
          `, [account.unique, row.id]);
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

// Export the pool for queries
module.exports = {
  query: async (text, params) => {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  },
  initDb,  // Call this on server start
};