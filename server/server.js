require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const clothingRoutes = require("./routes/clothingRoutes");
const swapRoutes = require("./routes/swapRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require("path");

console.log(
  "JWT_SECRET loaded:",
  Boolean(process.env.JWT_SECRET)
);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://clothswap-frontend-9pjp.onrender.com"
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/clothes", clothingRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.get("/api/messages/test", (req, res) => {
  res.json({ success: true, message: "Message route working!" });
});
// Home route
app.get("/", (req, res) => {
  res.send("Cloth Swap Backend is running!");
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Cloth Swap API is working!",
  });
});

// Connect MongoDB, then start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();