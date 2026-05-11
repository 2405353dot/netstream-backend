const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =========================================================
   CREATE UPLOAD FOLDERS
========================================================= */

const videoUploadDir = "uploads/videos";
const subtitleUploadDir = "uploads/subtitles";

if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

if (!fs.existsSync(subtitleUploadDir)) {
  fs.mkdirSync(subtitleUploadDir, { recursive: true });
}

/* =========================================================
   STORAGE CONFIG
========================================================= */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "subtitle") {
      cb(null, subtitleUploadDir);
    } else {
      cb(null, videoUploadDir);
    }
  },

  filename(req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
  console.log("Uploaded file:", file.originalname);
  console.log("Uploaded file type:", file.mimetype);

  const ext = path.extname(file.originalname).toLowerCase();

  const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
    "video/x-msvideo",
    "application/octet-stream",
  ];

  const allowedVideoExtensions = [
    ".mp4",
    ".webm",
    ".mov",
    ".mkv",
    ".avi",
  ];

  const allowedSubtitleExtensions = [".vtt"];

  if (file.fieldname === "subtitle") {
    if (allowedSubtitleExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .vtt subtitle files are allowed"), false);
    }
  } else {
    if (
      allowedVideoTypes.includes(file.mimetype) ||
      allowedVideoExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"), false);
    }
  }
};

/* =========================================================
   MULTER CONFIG
========================================================= */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2000, // 2GB
  },
});

module.exports = upload; 