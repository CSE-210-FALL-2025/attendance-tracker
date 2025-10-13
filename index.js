// Main Express app for Vercel deployment
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API routes - these will be handled by Vercel Functions
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Serve static files
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Export the app for Vercel
export default app;
