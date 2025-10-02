const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const { initDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',  // Local development
    'https://wabos.netlify.app',  // Replace with your actual Netlify URL
  ],
  credentials: true
}));
app.use(express.json());

// API routes
app.use('/api', authRoutes);

// Serve frontend build
const frontendDist = path.join(__dirname, '../../dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Init DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
