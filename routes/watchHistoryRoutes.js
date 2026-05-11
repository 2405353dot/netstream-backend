const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* ================= AUTH MIDDLEWARE DIRECTLY HERE ================= */

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

/* ================= SAVE / UPDATE WATCH PROGRESS ================= */

router.post("/progress", protect, async (req, res) => {
  try {
    const { videoId, progress, duration } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingVideo = user.watchHistory.find(
      (item) => item.video.toString() === videoId
    );

    if (existingVideo) {
      existingVideo.progress = progress;
      existingVideo.duration = duration;
      existingVideo.watchedAt = new Date();
    } else {
      user.watchHistory.unshift({
        video: videoId,
        progress,
        duration,
        watchedAt: new Date(),
      });
    }

    await user.save();

    res.json({ message: "Watch progress saved" });
  } catch (error) {
    res.status(500).json({
      message: "Error saving watch progress",
      error: error.message,
    });
  }
});

/* ================= GET CONTINUE WATCHING ================= */

router.get("/continue", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("watchHistory.video");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const continueWatching = user.watchHistory
      .filter((item) => item.video)
      .map((item) => ({
        _id: item.video._id,
        title: item.video.title,
        description: item.video.description,
        category: item.video.category,
        thumbnail: item.video.thumbnail,
        thumbnailUrl: item.video.thumbnailUrl,
        videoUrl: item.video.videoUrl,
        video: item.video.video,
        progress: item.progress,
        duration: item.duration,
        watchedAt: item.watchedAt,
      }))
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

    res.json(continueWatching);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching continue watching",
      error: error.message,
    });
  }
});

module.exports = router; 