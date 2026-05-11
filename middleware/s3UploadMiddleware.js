const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".mp4", ".webm", ".mov", ".mkv", ".avi"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"), false);
  }
};

const s3Upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2000,
  },
});

module.exports = s3Upload; 