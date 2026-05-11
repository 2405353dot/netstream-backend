const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // CHECK AUTH HEADER
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // NO TOKEN
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIND USER
    const user = await User.findById(decoded.id).select("-password");

    // USER NOT FOUND
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ATTACH USER TO REQUEST
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ADMIN MIDDLEWARE
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
};

module.exports = { protect, adminOnly };   