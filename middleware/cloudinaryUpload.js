const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: "netstream/videos",

    resource_type: "video",

    allowed_formats: [
      "mp4",
      "mov",
      "avi",
      "mkv",
      "webm",
    ],

    public_id:
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-"),
  }),
});

const uploadCloudinary = multer({
  storage,
});

module.exports = uploadCloudinary;