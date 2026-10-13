const express = require("express");
const Clothing = require("../models/Clothing");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "clothswap",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

// Get all clothing listings
router.get("/", async (req, res) => {
  try {
    const clothes = await Clothing.find().sort({ createdAt: -1 });
    res.json({ success: true, data: clothes });
  } catch (error) {
    console.error("Fetch clothes error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clothing listings",
    });
  }
});

// Get logged-in user's clothing
router.get("/my-clothes", authMiddleware, async (req, res) => {
  try {
    const clothes = await Clothing.find({
      owner: req.userId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: clothes });
  } catch (error) {
    console.error("My clothes error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your clothing listings",
    });
  }
});

// Get other users' available clothing
router.get("/others", authMiddleware, async (req, res) => {
  try {
    const clothes = await Clothing.find({
      owner: { $ne: req.userId },
      status: "Available",
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: clothes });
  } catch (error) {
    console.error("Others' clothes error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch other users' clothes.",
    });
  }
});

// Get available clothing from users in the same city
router.get("/nearby", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    const city = currentUser.location?.city?.trim();
    const state = currentUser.location?.state?.trim();

    if (!city || !state) {
      return res.status(400).json({
        success: false,
        message: "Please add your city and state to find nearby swaps.",
      });
    }

    const escapeRegex = (value) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const nearbyUsers = await User.find({
      _id: { $ne: currentUser._id },
      "location.city": {
        $regex: `^${escapeRegex(city)}$`,
        $options: "i",
      },
      "location.state": {
        $regex: `^${escapeRegex(state)}$`,
        $options: "i",
      },
    }).select("_id");

    const userIds = nearbyUsers.map((user) => user._id);

    const clothes = await Clothing.find({
      owner: { $in: userIds },
      status: "Available",
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: clothes });
  } catch (error) {
    console.error("Nearby clothes error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby clothing listings.",
    });
  }
});

// Get one clothing listing
router.get("/:id", async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    res.json(clothing);
  } catch (error) {
    res.status(400).json({
      message: "Invalid clothing ID",
    });
  }
});

// Add a clothing listing
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        size,
        condition,
        imageUrl,
        estimatedValue,
      } = req.body;

      if (
        !title?.trim() ||
        !description?.trim() ||
        !category?.trim() ||
        !size?.trim() ||
        !condition?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required fields.",
        });
      }

      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please log in again.",
        });
      }

      const clothing = await Clothing.create({
        title,
        description,
        category,
        size,
        condition,
        estimatedValue: Number(estimatedValue) || 0,
        imageUrl: req.file ? req.file.path : imageUrl || "",
        ownerName: user.name,
        owner: user._id,
      });

      res.status(201).json({
        success: true,
        data: clothing,
      });
    } catch (error) {
      console.error("Add clothing error:", error.message);
      res.status(400).json({
        success: false,
        message: "Could not add clothing listing.",
      });
    }
  }
);

module.exports = router;