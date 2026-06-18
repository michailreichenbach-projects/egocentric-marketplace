import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { uploadRouter } from "./routes/upload";
import { clipsRouter } from "./routes/clips";
import { db } from "./db";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", db: "connected", ts: new Date().toISOString() });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// Routes
app.use("/upload", uploadRouter);
app.use("/clips", clipsRouter);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
