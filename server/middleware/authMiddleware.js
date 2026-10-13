const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please login to continue.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.userRole = decoded.role || "user";

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or token is invalid. Please login again.",
    });
  }
}

function adminMiddleware(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
}

module.exports = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;