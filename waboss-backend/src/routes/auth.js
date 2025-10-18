const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { pool: db } = require('../db/database');
const url = require('url');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require("cors");
const app = express();
require('dotenv').config();

const otpStore = new Map();
const router = express.Router();

app.use(cors({
  origin: ["http://localhost:5173", "https://waboss.maxyprime.com"],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});


router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Auto-generate username from email
    const username = email.split("@")[0];

    // Check for existing user
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows.length > 0)
      return res.status(400).json({ message: "Email sudah terdaftar." });

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Insert into users
    await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "Pendaftaran berhasil." });
  } catch (error) {
    console.error("Register server error:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- SEND OTP ---
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with 5-minute expiry
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

    // Configure your mailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use your SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"WABoss Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "WABoss Password Reset OTP",
      html: `
        <h3>Password Reset Request</h3>
        <p>Here is your OTP code to reset your password:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);

    res.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// --- VERIFY OTP ---
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ message: "OTP not found or expired" });

  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }

  // Mark as verified
  otpStore.set(email, { ...record, verified: true });
  res.json({ message: "OTP verified successfully" });
});

// --- RESET PASSWORD ---
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "Email, OTP, and new password are required" });

  const record = otpStore.get(email);
  if (!record || record.otp !== otp || !record.verified)
    return res.status(400).json({ message: "Invalid or unverified OTP" });

  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10);
  await db.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

  otpStore.delete(email);
  res.json({ message: "Password reset successful. You can now log in." });
});

router.get('/get-whatsapp-servers', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Fetching WhatsApp servers for user:', decoded.id);

    const response = await axios.get('https://maxyprime.com/api/get/wa.servers', {
      params: { secret: process.env.MAXYPRIME_API_SECRET },
    });

    if (response.data.status !== 200) {
      return res.status(response.data.status).json({ message: response.data.message || 'Failed to fetch servers' });
    }

    const servers = Array.isArray(response.data.data)
      ? response.data.data.map((s) => ({
          id: s.id,
          name: s.name,
          status: s.status,
          available: s.available,
          connected: s.connected ?? 0,
        }))
      : [];

    res.json({ servers });
  } catch (error) {
    console.error('Get WhatsApp servers error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/link-whatsapp', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { sid } = req.body;

  if (!token) return res.status(400).json({ message: 'Token is required' });
  if (!sid) return res.status(400).json({ message: 'SID is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // ✅ Auto-generate placeholder phone (since user no longer inputs it)
    const phoneNumber = `pending_${userId}_${Date.now()}`;

    console.log(`Auto selecting SID ${sid} for user ${userId}`);

    // ✅ Call MaxyPrime to generate QR code
    const response = await axios.get('https://maxyprime.com/api/create/wa.link', {
      params: {
        secret: process.env.MAXYPRIME_API_SECRET,
        sid,
      },
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.status !== 200 || !response.data.data) {
      return res.status(response.data.status || 500).json({
        message: response.data.message || 'Failed to link WhatsApp',
      });
    }

    const data = response.data.data;

    // ✅ Insert or update into temp_whatsapp_links with placeholder phone
    await db.query(
      `INSERT INTO temp_whatsapp_links (user_id, sid, phone, token, qrstring, qrimagelink, infolink)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, phone)
       DO UPDATE SET sid=$2, token=$4, qrstring=$5, qrimagelink=$6, infolink=$7, created_at=CURRENT_TIMESTAMP`,
      [
        userId,
        sid,
        phoneNumber,
        data.token || null,
        data.qrstring || null,
        data.qrimagelink || null,
        data.infolink || null,
      ]
    );

    // ✅ Return QR and info data to frontend
    res.json({
      data: {
        qrstring: data.qrstring || null,
        qrimagelink: data.qrimagelink || null,
        infolink: data.infolink || null,
        waToken: data.token || null,
        sid,
      },
    });
  } catch (error) {
    console.error('Auto Link WhatsApp error:', error.message);

    if (error.response) {
      console.error('Response data:', error.response.data);
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    res.status(500).json({ message: 'Server error' });
  }
});


// FIXED: Changed response format to match frontend expectations
router.post('/check-whatsapp-account', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { phone } = req.body;

  // ✅ Normalize phone number
  let phoneNumber = phone.trim();
  if (!phoneNumber.startsWith("+62")) {
    phoneNumber = "+62" + phoneNumber.replace(/^0+/, "");
  }

  if (!token) return res.status(400).json({ message: 'Token is required' });
  if (!phone) return res.status(400).json({ message: 'Phone is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`User ${decoded.id} checking WhatsApp account for phone: ${phoneNumber}`);

    // Fetch ALL accounts from MaxyPrime
    const response = await axios.get('https://maxyprime.com/api/get/wa.accounts', {
      params: {
        secret: process.env.MAXYPRIME_API_SECRET,
        limit: 100000,
        page: 1,
      },
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    console.log('check-whatsapp-account response status:', response.data.status);

    if (response.data.status !== 200 || !Array.isArray(response.data.data)) {
      console.error('Invalid response from MaxyPrime:', response.data);
      return res.status(response.data.status || 500).json({
        message: response.data.message || 'Failed to fetch accounts'
      });
    }

    // ✅ Use normalized number for matching
    const account = response.data.data.find(acc => acc.phone === phoneNumber);

    console.log(`Account found for ${phoneNumber}:`, account ? {
      phone: account.phone,
      status: account.status,
      unique: account.unique
    } : 'NOT FOUND');

    if (!account) {
      return res.json({ isLinked: false });
    }

    return res.json({
      isLinked: true,
      status: account.status || 'disconnected',
      phone: account.phone,
      unique_id: account.unique,
      id: account.id,
    });
  } catch (error) {
    console.error('Check WhatsApp account error:', error.message);
    if (error.response) console.error('Response data:', error.response.data);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(408).json({ message: 'Request timeout - MaxyPrime API is slow' });
    }
    res.status(500).json({ message: 'Server error checking account' });
  }
});

// NEW: Endpoint to save linked account after successful scan
router.post('/save-linked-account', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { phone, unique_id, status, sid } = req.body;

  // ✅ Normalize phone number
  let phoneNumber = phone.trim();
  if (!phoneNumber.startsWith("+62")) {
    phoneNumber = "+62" + phoneNumber.replace(/^0+/, "");
  }

  if (!token) return res.status(400).json({ message: 'Token is required' });
  if (!phone) return res.status(400).json({ message: 'Phone is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`User ${decoded.id} saving linked account for phone: ${phoneNumber}`);

    // Check if account already exists
    const { rows: existing } = await db.query(
      'SELECT * FROM whatsapp_accounts WHERE user_id = $1 AND phone = $2',
      [decoded.id, phoneNumber]
    );

    if (existing.length > 0) {
      // ✅ Update existing account
      await db.query(
        `UPDATE whatsapp_accounts 
         SET unique_id = $1, status = $2, sid = $3 
         WHERE user_id = $4 AND phone = $5`,
        [unique_id, status || 'connected', sid, decoded.id, phoneNumber]
      );
      console.log(`✅ Updated existing account for phone ${phoneNumber}`);
    } else {
      // ✅ Insert new account
      await db.query(
        `INSERT INTO whatsapp_accounts (user_id, phone, unique_id, status, sid) 
         VALUES ($1, $2, $3, $4, $5)`,
        [decoded.id, phoneNumber, unique_id, status || 'connected', sid]
      );
      console.log(`✅ Inserted new account for phone ${phoneNumber}`);
    }

    // ✅ Clean up temp table
    await db.query(
      'DELETE FROM temp_whatsapp_links WHERE user_id = $1 AND phone = $2',
      [decoded.id, phoneNumber]
    );

    res.json({ message: 'Account saved successfully' });
  } catch (error) {
    console.error('Save linked account error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Server error saving account' });
  }
});

router.post("/clear-temp-link", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { waToken } = req.body;

  if (!token || !waToken)
    return res.status(400).json({ message: "Missing required data" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await db.query(
      "DELETE FROM temp_whatsapp_links WHERE user_id = $1 AND token = $2",
      [userId, waToken]
    );

    console.log(`🧹 Cleared temp link for user ${userId}`);
    res.json({ message: "Temp link cleared successfully." });
  } catch (err) {
    console.error("Clear temp link error:", err.message);
    res.status(500).json({ message: "Server error clearing temp link" });
  }
});


router.get("/get-linked-accounts", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log("Fetching linked accounts for user:", userId);

    // ✅ Step 1: Fetch linked WhatsApp accounts from your main table
    const { rows: userAccounts } = await db.query(
      `SELECT phone, sid, unique_id, created_at
       FROM linked_whatsapp
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // If user has no linked WhatsApp yet
    if (userAccounts.length === 0) {
      return res.json([]); 
    }

    // ✅ Step 2: Fetch live WhatsApp accounts from MaxyPrime
    const response = await axios.get("https://maxyprime.com/api/get/wa.accounts", {
      params: {
        secret: process.env.MAXYPRIME_API_SECRET,
        limit: 100000,
        page: 1,
      },
    });

    if (response.data.status !== 200 || !Array.isArray(response.data.data)) {
      return res
        .status(response.data.status || 500)
        .json({ message: response.data.message || "Failed to fetch live accounts from MaxyPrime" });
    }

    const maxyAccounts = response.data.data;

    // ✅ Step 3: Merge local DB + live data
    const merged = userAccounts.map((dbAcc) => {
      const normalizedPhone = dbAcc.phone.startsWith("+62")
        ? dbAcc.phone
        : "+62" + dbAcc.phone.replace(/^0+/, "");

      const live = maxyAccounts.find((m) => m.phone === normalizedPhone);

      return {
        phone: normalizedPhone,
        sid: dbAcc.sid,
        unique_id: dbAcc.unique_id,
        status: live ? live.status : "unknown",
        created_at: dbAcc.created_at,
      };
    });

    res.json(merged);
  } catch (error) {
    console.error("Get linked accounts server error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-linked-whatsapp", (req, res, next) => {
  req.url = "/get-linked-accounts";
  router.handle(req, res, next);
});

router.post("/relink-whatsapp", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { phone, sid, unique_id } = req.body; // Get unique_id from request
  // ✅ Normalize phone number
  let phoneNumber = phone ? phone.trim() : "";
  if (phoneNumber && !phoneNumber.startsWith("+62")) {
  phoneNumber = "+62" + phoneNumber.replace(/^0+/, "");
  }
  if (!token) return res.status(400).json({ message: "Token is required" });
  if (!unique_id) {
    return res.status(400).json({ message: "Unique ID is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    console.log(`User ${userId} relinking WhatsApp for phone ${phoneNumber}, unique_id: ${unique_id}`);

    // Call MaxyPrime API - note the parameter is 'unique' not 'unique_id'
    const response = await axios.get("https://maxyprime.com/api/create/wa.relink", {
      params: {
        secret: process.env.MAXYPRIME_API_SECRET,
        unique: unique_id, // ✅ Fixed - API expects 'unique' parameter
        sid: sid || undefined, // Optional
      },
    });

    console.log("Relink response from MaxyPrime:", response.data);

    if (response.data.status !== 200) {
      return res
        .status(response.data.status || 500)
        .json({ message: response.data.message || "Failed to relink WhatsApp" });
    }

    // Return the QR data to frontend
    res.json({
      message: "Relink QR generated successfully",
      data: {
        qrstring: response.data.data?.qrstring || null,
        qrimagelink: response.data.data?.qrimagelink || null,
        infolink: response.data.data?.infolink || null,
      },
    });
  } catch (error) {
    console.error("Relink WhatsApp error:", error.message);
    if (error.response) {
      console.error("MaxyPrime API error:", error.response.data);
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/whatsapp/confirm", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { waNumber, uniqueId, sid, waToken } = req.body;

  if (!token) return res.status(400).json({ message: "Token is required" });
  if (!waNumber || !uniqueId)
    return res
      .status(400)
      .json({ message: "WhatsApp number and unique ID are required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    console.log(`✅ Confirming WhatsApp link for user ${userId}, ${waNumber}`);

    // Normalize phone number
    let phoneNumber = waNumber.trim();
    if (!phoneNumber.startsWith("+62")) {
      phoneNumber = "+62" + phoneNumber.replace(/^0+/, "");
    }

    // 🧠 Ownership protection — prevent hijacking
    const existing = await db.query(
      "SELECT user_id FROM linked_whatsapp WHERE phone = $1",
      [phoneNumber]
    );

    if (existing.rows.length > 0 && existing.rows[0].user_id !== userId) {
      return res.status(401).json({
        message:
          "⚠️ This WhatsApp number is already linked to another user account.",
      });
    }

    // 🗃️ Save or update linked record
    await db.query(
      `INSERT INTO linked_whatsapp (user_id, sid, phone, unique_id, token, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, phone)
       DO UPDATE SET sid=$2, unique_id=$4, token=$5, updated_at=CURRENT_TIMESTAMP`,
      [userId, sid || null, phoneNumber, uniqueId, waToken || null]
    );

    // 🧹 Cleanup temporary QR entry if exists
    if (waToken) {
      await db.query(
        "DELETE FROM temp_whatsapp_links WHERE user_id = $1 AND token = $2",
        [userId, waToken]
      );
      console.log(
        `🧹 Temp link for token ${waToken.slice(0, 10)}... cleared from temp_whatsapp_links`
      );
    }

    res.json({
      message: "WhatsApp account successfully linked and saved.",
      phone: phoneNumber,
      userId,
    });
  } catch (error) {
    console.error("Confirm WhatsApp error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/get-earnings", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log("Fetching earnings for user:", userId);

    // ✅ Step 1: Get linked numbers from new table
    const { rows: phoneRows } = await db.query(
      "SELECT phone FROM linked_whatsapp WHERE user_id = $1",
      [userId]
    );

    const linkedPhones = phoneRows.map((r) => r.phone);

    if (linkedPhones.length === 0) {
      return res.json({
        total_sent: 0,
        total_earnings: 0,
        linked_phones_count: 0,
        phone_details: [],
        last_updated: new Date().toISOString(),
      });
    }

    let totalSent = 0;
    const phoneResults = [];

    // ✅ Step 2: Fetch sent-count for each number from MaxyPrime
    for (const phone of linkedPhones) {
      try {
        const response = await axios.get(
          "https://maxyprime.com/api/get/wa.sent-count",
          {
            params: { secret: process.env.MAXYPRIME_API_SECRET, account: phone },
            timeout: 10000,
          }
        );

        const apiData = response.data?.data;
        let sentCount = 0;

        if (response.data?.status === 200 && apiData) {
          sentCount =
            apiData.total_messages_sent ??
            apiData.sent_count ??
            apiData.total_sent ??
            apiData.count ??
            apiData.messages ??
            (typeof apiData === "number" ? apiData : 0);

          sentCount = Number(sentCount) || 0;
        }

        totalSent += sentCount;
        phoneResults.push({
          phone,
          sent_count: sentCount,
          status: response.data?.status === 200 ? "success" : "failed",
          raw: apiData,
        });
      } catch (err) {
        console.error(`❌ Error fetching sent-count for ${phone}:`, err.message);
        phoneResults.push({
          phone,
          sent_count: 0,
          status: "error",
          error: err.message,
        });
      }

      // Wait briefly between calls (to avoid rate limiting)
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // ✅ Step 3: Calculate totals and return
    res.json({
      total_sent: totalSent,
      total_earnings: totalSent * 30,
      linked_phones_count: linkedPhones.length,
      phone_details: phoneResults,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get earnings server error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Add these routes to waboss-backend/src/routes/auth.js

// Check if user is eligible for first link bonus
router.get("/check-first-link-bonus", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if user has claimed bonus
    const { rows: userRows } = await db.query(
      "SELECT first_link_bonus_claimed, bonus_balance FROM users WHERE id = $1",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    // Check if user has any linked WhatsApp accounts
    const { rows: linkedRows } = await db.query(
      "SELECT COUNT(*) as count FROM linked_whatsapp WHERE user_id = $1",
      [userId]
    );

    const hasLinkedAccount = linkedRows[0].count > 0;

    res.json({
      eligible: !user.first_link_bonus_claimed && hasLinkedAccount,
      alreadyClaimed: user.first_link_bonus_claimed,
      hasLinkedAccount,
      currentBonus: user.bonus_balance || 0
    });
  } catch (error) {
    console.error("Check first link bonus error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get user-linked accounts with live status
router.get("/get-user-accounts", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 1: Fetch user's linked numbers from DB
    const dbResult = await req.db.query(
      "SELECT phone FROM whatsapp_accounts WHERE user_id = $1",
      [decoded.id]
    );
    const dbAccounts = dbResult.rows;

    if (dbAccounts.length === 0) {
      return res.json([]);
    }

    // Step 2: Get live statuses from Maxyprime
    const response = await axios.get("https://maxyprime.com/api/get/wa.accounts", {
      params: {
        secret: process.env.MAXYPRIME_API_SECRET,
        limit: 100000,
        page: 1,
      },
    });

    if (response.data.status !== 200 || !Array.isArray(response.data.data)) {
      return res
        .status(response.data.status || 500)
        .json({ message: response.data.message || "Failed to fetch accounts" });
    }

    const maxyAccounts = response.data.data;

    // Step 3: Merge DB numbers with live statuses
    const merged = dbAccounts.map((dbAcc) => {
      const live = maxyAccounts.find((m) => m.phone === dbAcc.phone);
      return {
        phone: dbAcc.phone,
        status: live ? live.status : "unknown",
      };
    });

    res.json(merged);
  } catch (error) {
    console.error("Get user accounts error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Claim first link bonus
router.post("/claim-first-link-bonus", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Start transaction
    await db.query("BEGIN");

    // Check eligibility
    const { rows: userRows } = await db.query(
      "SELECT first_link_bonus_claimed, bonus_balance FROM users WHERE id = $1",
      [userId]
    );

    if (userRows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    if (user.first_link_bonus_claimed) {
      await db.query("ROLLBACK");
      return res.status(400).json({ message: "Bonus already claimed" });
    }

    // Check if user has linked WhatsApp
    const { rows: linkedRows } = await db.query(
      "SELECT COUNT(*) as count FROM linked_whatsapp WHERE user_id = $1",
      [userId]
    );

    if (linkedRows[0].count === 0) {
      await db.query("ROLLBACK");
      return res.status(400).json({ message: "No linked WhatsApp account found" });
    }

    const bonusAmount = 5000; // Rp 5.000

    // Update user balance and mark bonus as claimed
    await db.query(
      `UPDATE users 
       SET first_link_bonus_claimed = TRUE, 
           bonus_balance = COALESCE(bonus_balance, 0) + $1
       WHERE id = $2`,
      [bonusAmount, userId]
    );

    // Record the reward
    await db.query(
      `INSERT INTO user_rewards (user_id, reward_type, amount, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, reward_type) DO NOTHING`,
      [userId, "first_link", bonusAmount, "Bonus untuk link WhatsApp pertama"]
    );

    await db.query("COMMIT");

    res.json({
      success: true,
      message: "Bonus berhasil diklaim!",
      amount: bonusAmount,
      newBalance: (user.bonus_balance || 0) + bonusAmount
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Claim first link bonus error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's total balance (earnings + bonus)
router.get("/get-total-balance", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get bonus balance
    const { rows: userRows } = await db.query(
      "SELECT bonus_balance FROM users WHERE id = $1",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get earnings (you'll need to call your existing earnings endpoint)
    // For now, we'll just return the bonus
    const bonusBalance = userRows[0].bonus_balance || 0;

    res.json({
      bonusBalance,
      totalBalance: bonusBalance // Add earnings here when integrated
    });
  } catch (error) {
    console.error("Get total balance error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's reward history
router.get("/get-reward-history", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { rows } = await db.query(
      `SELECT reward_type, amount, claimed_at, description
       FROM user_rewards
       WHERE user_id = $1
       ORDER BY claimed_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get reward history error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;