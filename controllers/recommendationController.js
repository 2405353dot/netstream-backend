const User = require("../models/User");
const Video = require("../models/Video");

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("watchHistory.video")
      .populate("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allVideos = await Video.find();

    const watchedVideoIds = user.watchHistory
      .filter((item) => item.video)
      .map((item) => item.video._id.toString());

    const categoryScore = {};
    const tagScore = {};

    user.watchHistory.forEach((item) => {
      if (!item.video) return;

      const video = item.video;
      const category = video.category;

      if (!categoryScore[category]) {
        categoryScore[category] = 0;
      }

      let score = 3;

      if (item.progress >= 80) score += 8;
      else if (item.progress >= 50) score += 5;
      else if (item.progress >= 20) score += 2;

      categoryScore[category] += score;

      if (video.tags && video.tags.length > 0) {
        video.tags.forEach((tag) => {
          if (!tagScore[tag]) {
            tagScore[tag] = 0;
          }

          tagScore[tag] += score;
        });
      }
    });

    user.watchlist.forEach((video) => {
      if (!video) return;

      if (!categoryScore[video.category]) {
        categoryScore[video.category] = 0;
      }

      categoryScore[video.category] += 6;

      if (video.tags && video.tags.length > 0) {
        video.tags.forEach((tag) => {
          if (!tagScore[tag]) {
            tagScore[tag] = 0;
          }

          tagScore[tag] += 4;
        });
      }
    });

    const recommendations = allVideos
      .filter((video) => !watchedVideoIds.includes(video._id.toString()))
      .map((video) => {
        let recommendationScore = 0;

        if (categoryScore[video.category]) {
          recommendationScore += categoryScore[video.category] * 5;
        }

        if (video.tags && video.tags.length > 0) {
          video.tags.forEach((tag) => {
            if (tagScore[tag]) {
              recommendationScore += tagScore[tag] * 3;
            }
          });
        }

        recommendationScore += video.views * 0.2;

        if (video.featured) {
          recommendationScore += 10;
        }

        const daysOld =
          (Date.now() - new Date(video.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);

        if (daysOld <= 7) recommendationScore += 5;
        else if (daysOld <= 30) recommendationScore += 2;

        return {
          ...video.toObject(),
          recommendationScore,
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 12);

    if (recommendations.length === 0) {
      const fallbackVideos = await Video.find()
        .sort({ views: -1, createdAt: -1 })
        .limit(12);

      return res.status(200).json({
        success: true,
        videos: fallbackVideos,
      });
    }

    res.status(200).json({
      success: true,
      videos: recommendations,
    });
  } catch (error) {
    console.error("Recommendation Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
};

module.exports = { getRecommendations }; 