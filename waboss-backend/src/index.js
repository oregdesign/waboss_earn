const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const { initDb } = require('./db/database');  // Adjusted path if needed

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);

// Init DB then start server
initDb().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
