// waboss-backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend 🚀" });
});

// Serve frontend build
const frontendPath = path.join(__dirname, "../dist");
app.use(express.static(frontendPath));

// React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
