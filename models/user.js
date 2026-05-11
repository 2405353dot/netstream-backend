const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    watchHistory: [watchHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema); 