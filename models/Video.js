const mongoose = require("mongoose");

/* ================= EPISODE SCHEMA ================= */

const episodeSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },

  description: {
    type: String,
  },

  thumbnail: {
    type: String,
  },

  videoUrl: {
    type: String,
  },

  hlsUrl: {
    type: String,
    default: "",
  },

  duration: {
    type: Number,
    default: 0,
  },

  episodeNumber: {
    type: Number,
    default: 1,
  },
});

/* ================= SUBTITLE SCHEMA ================= */

const subtitleSchema = new mongoose.Schema({
  label: {
    type: String,
    default: "English",
    trim: true,
  },

  srcLang: {
    type: String,
    default: "en",
    trim: true,
  },

  src: {
    type: String,
    required: true,
  },

  default: {
    type: Boolean,
    default: false,
  },

  kind: {
    type: String,
    default: "subtitles",
  },
});

/* ================= QUALITY SCHEMA ================= */

const qualitySchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ["1080p", "720p", "480p", "240p"],
    required: true,
  },

  url: {
    type: String,
    required: true,
  },

  resolution: {
    type: Number,
    default: 720,
  },
});

/* ================= MAIN VIDEO SCHEMA ================= */

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    /* ================= MAIN VIDEO FILE ================= */

    videoUrl: {
      type: String,
      default: "",
    },

    hlsUrl: {
      type: String,
      default: "",
    },

    qualities: [qualitySchema],

    /* ================= TRAILER ================= */

    trailerUrl: {
      type: String,
      default: "",
    },

    /* ================= PLAYER FEATURES ================= */

    introStart: {
      type: Number,
      default: 0,
    },

    introEnd: {
      type: Number,
      default: 85,
    },

    previewStart: {
      type: Number,
      default: 30,
    },

    previewEnd: {
      type: Number,
      default: 45,
    },

    /* ================= SUBTITLES ================= */

    subtitles: [subtitleSchema],

    /* ================= EPISODES ================= */

    episodes: [episodeSchema],

    /* ================= AI / RECOMMENDATION ================= */

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    /* ================= STATS ================= */

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    /* ================= NETFLIX UI ================= */

    maturityRating: {
      type: String,
      default: "13+",
    },

    duration: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    trending: {
      type: Boolean,
      default: false,
    },

    top10: {
      type: Boolean,
      default: false,
    },

    /* ================= HERO BANNER ================= */

    heroImage: {
      type: String,
      default: "",
    },

    logoImage: {
      type: String,
      default: "",
    },

    /* ================= DETAILS ================= */

    releaseYear: {
      type: Number,
      default: 2026,
    },

    matchPercentage: {
      type: Number,
      default: 98,
    },

    language: {
      type: String,
      default: "English",
    },

    /* ================= CONTINUE WATCHING ================= */

    continueWatchingEnabled: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema); 