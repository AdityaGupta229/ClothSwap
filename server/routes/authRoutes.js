const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, city, state } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, valid email and password (at least 8 characters) are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      location: {
        city: typeof city === "string" ? city.trim() : "",
        state: typeof state === "string" ? state.trim() : "",
      },
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not create account.",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from server environment.");
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() ,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not log in.",
    });
  }
});

// Update current user's location
router.put("/location", authMiddleware, async (req, res) => {
  try {
    const { city, state } = req.body;

    if (
      typeof city !== "string" ||
      typeof state !== "string" ||
      !city.trim() ||
      !state.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "City and state are required.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          "location.city": city.trim(),
          "location.state": state.trim(),
        },
      },
      { new: true, runValidators: true }
    ).select("_id name location");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      message: "Location updated successfully.",
      data: {
        city: user.location?.city || "",
        state: user.location?.state || "",
      },
    });
  } catch (error) {
    console.error("Location update error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not update location.",
    });
  }
});

module.exports = router;