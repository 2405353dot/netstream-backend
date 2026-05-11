const express = require("express");
const path = require("path");

const Video = require("../models/Video");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const uploadVideo = require("../middleware/uploadMiddleware");

const cloudinaryUpload = require("../middleware/cloudinaryUpload");

const convertToHLS = require("../utils/hlsConverter");

const router = express.Router();

/* =========================================================
   GET ALL VIDEOS
========================================================= */

router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({
      createdAt: -1,
    });

    res.json(videos);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch videos",
      error: error.message,
    });
  }
});

/* =========================================================
   VIDEO + SUBTITLE UPLOAD
========================================================= */

router.post(
  "/upload",

  protect,

  adminOnly,

  uploadVideo.fields([
    {
      name: "video",
      maxCount: 1,
    },

    {
      name: "subtitle",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {
      const videoFile =
        req.files?.video?.[0];

      const subtitleFile =
        req.files?.subtitle?.[0];

      if (!videoFile) {
        return res.status(400).json({
          message: "No video uploaded",
        });
      }

      /* =========================================================
         VIDEO URL
      ========================================================= */

      const videoPath = videoFile.path;

      const videoUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/videos/${videoFile.filename}`;

      /* =========================================================
         HLS CONVERSION
      ========================================================= */

      const tempVideoId = path.parse(
        videoFile.filename
      ).name;

      const hlsPath = await convertToHLS(
        videoPath,
        tempVideoId
      );

      const hlsUrl = `${req.protocol}://${req.get(
        "host"
      )}${hlsPath}`;

      /* =========================================================
         SUBTITLE URL
      ========================================================= */

      let subtitleUrl = "";

      if (subtitleFile) {
        subtitleUrl = `${req.protocol}://${req.get(
          "host"
        )}/uploads/subtitles/${subtitleFile.filename}`;
      }

      /* =========================================================
         RESPONSE
      ========================================================= */

      res.status(201).json({
        message:
          "Video uploaded and converted successfully",

        videoUrl,

        hlsUrl,

        subtitleUrl,

        fileName: videoFile.filename,
      });
    } catch (error) {
      console.log("Upload error:", error);

      res.status(500).json({
        message: "Upload failed",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   CLOUDINARY VIDEO UPLOAD
========================================================= */

router.post(
  "/upload-cloudinary",

  protect,

  adminOnly,

  cloudinaryUpload.single("video"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No video uploaded",
        });
      }

      res.status(201).json({
        message:
          "Video uploaded to Cloudinary successfully",

        videoUrl: req.file.path,

        public_id: req.file.filename,
      });
    } catch (error) {
      res.status(500).json({
        message: "Cloudinary upload failed",

        error: error.message,
      });
    }
  }
);

/* =========================================================
   FEATURED VIDEOS
========================================================= */

router.get("/featured/all", async (req, res) => {
  try {
    const videos = await Video.find({
      featured: true,
    }).limit(20);

    res.json(videos);
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch featured videos",

      error: error.message,
    });
  }
});

/* =========================================================
   TRENDING VIDEOS
========================================================= */

router.get("/trending/all", async (req, res) => {
  try {
    const videos = await Video.find({
      trending: true,
    }).limit(20);

    res.json(videos);
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch trending videos",

      error: error.message,
    });
  }
});

/* =========================================================
   TOP 10 VIDEOS
========================================================= */

router.get("/top10/all", async (req, res) => {
  try {
    const videos = await Video.find({
      top10: true,
    }).limit(10);

    res.json(videos);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch top videos",

      error: error.message,
    });
  }
});

/* =========================================================
   SEARCH
========================================================= */

router.get("/search/query", async (req, res) => {
  try {
    const search = req.query.q;

    if (!search) {
      return res.status(400).json({
        message: "Search query missing",
      });
    }

    const videos = await Video.find({
      $or: [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },

        {
          description: {
            $regex: search,
            $options: "i",
          },
        },

        {
          category: {
            $regex: search,
            $options: "i",
          },
        },

        {
          tags: {
            $in: [new RegExp(search, "i")],
          },
        },
      ],
    });

    res.json(videos);
  } catch (error) {
    res.status(500).json({
      message: "Search failed",

      error: error.message,
    });
  }
});

/* =========================================================
   CATEGORY
========================================================= */

router.get(
  "/category/:categoryName",

  async (req, res) => {
    try {
      const videos = await Video.find({
        category: req.params.categoryName,
      });

      res.json(videos);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch category videos",

        error: error.message,
      });
    }
  }
);

/* =========================================================
   ADD VIDEO
========================================================= */

router.post(
  "/",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        thumbnail,
        thumbnailUrl,
        videoUrl,
        hlsUrl,
        trailerUrl,
        featured,
        trending,
        top10,
        maturityRating,
        releaseYear,
        language,
        matchPercentage,
        duration,
        tags,
        subtitles,
        episodes,
      } = req.body;

      if (
        !title ||
        !description ||
        !category
      ) {
        return res.status(400).json({
          message:
            "Title, description and category are required",
        });
      }

      const finalThumbnail =
        thumbnail || thumbnailUrl;

      if (!finalThumbnail) {
        return res.status(400).json({
          message:
            "Thumbnail image URL is required",
        });
      }

      if (!videoUrl && !hlsUrl) {
        return res.status(400).json({
          message:
            "Either videoUrl or hlsUrl is required",
        });
      }

      const video = await Video.create({
        title,

        description,

        category,

        thumbnail: finalThumbnail,

        videoUrl: videoUrl || "",

        hlsUrl: hlsUrl || "",

        subtitles: subtitles || [],

        trailerUrl:
          trailerUrl ||
          videoUrl ||
          hlsUrl ||
          "",

        featured: Boolean(featured),

        trending: Boolean(trending),

        top10: Boolean(top10),

        maturityRating:
          maturityRating || "13+",

        releaseYear:
          releaseYear || 2026,

        language:
          language || "English",

        matchPercentage:
          matchPercentage || 98,

        duration: duration || 0,

        tags: tags || [],

        episodes: episodes || [],
      });

      res.status(201).json({
        message:
          "Video added successfully",

        video,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to add video",

        error: error.message,
      });
    }
  }
);

/* =========================================================
   UPDATE VIDEO
========================================================= */

router.put(
  "/:id",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const video = await Video.findById(
        req.params.id
      );

      if (!video) {
        return res.status(404).json({
          message: "Video not found",
        });
      }

      Object.assign(video, req.body);

      const updatedVideo =
        await video.save();

      res.json({
        message:
          "Video updated successfully",

        video: updatedVideo,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to update video",

        error: error.message,
      });
    }
  }
);

/* =========================================================
   DELETE VIDEO
========================================================= */

router.delete(
  "/:id",

  protect,

  adminOnly,

  async (req, res) => {
    try {
      const video = await Video.findById(
        req.params.id
      );

      if (!video) {
        return res.status(404).json({
          message: "Video not found",
        });
      }

      await video.deleteOne();

      res.json({
        message:
          "Video deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to delete video",

        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET SINGLE VIDEO
========================================================= */

router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(
      req.params.id
    );

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    video.views += 1;

    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch video",

      error: error.message,
    });
  }
});

module.exports = router; 