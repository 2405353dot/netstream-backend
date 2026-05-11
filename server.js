const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

/* ================= CREATE REQUIRED FOLDERS ================= */

const folders = [
  "uploads",
  "uploads/videos",
  "uploads/subtitles",
  "hls",
];

folders.forEach((folder) => {
  const folderPath = path.join(__dirname, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ================= MIDDLEWARE ================= */

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ================= STATIC FILES ================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/hls", express.static(path.join(__dirname, "hls")));

/* ================= ROUTES ================= */

const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");
const watchHistoryRoutes = require("./routes/watchHistoryRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/watch-history", watchHistoryRoutes);
app.use("/api/recommendations", recommendationRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.send("Netstream API Running...");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is live",
  });
});

/* ================= DATABASE + SERVER ================= */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
  }); 