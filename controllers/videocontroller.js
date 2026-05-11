 const Video = require("../models/Video");

// GET all videos
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single video by ID
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create video
const createVideo = async (req, res) => {
  try {
    const { title, description, category, image, videoUrl } = req.body;

    const newVideo = new Video({
      title,
      description,
      category,
      image,
      videoUrl,
    });

    const savedVideo = await newVideo.save();

    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  createVideo,
};