const express = require("express");
const User = require("../models/User");
const Clothing = require("../models/Clothing");
const SwapRequest = require("../models/SwapRequest");
const authMiddleware = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [totalUsers, totalClothes, totalRequests, pendingRequests] =
        await Promise.all([
          User.countDocuments(),
          Clothing.countDocuments(),
          SwapRequest.countDocuments(),
          SwapRequest.countDocuments({ status: "Pending" }),
        ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalClothes,
          totalRequests,
          pendingRequests,
        },
      });
    } catch (error) {
      console.error("Admin stats error:", error.message);

      res.status(500).json({
        success: false,
        message: "Could not load admin statistics.",
      });
    }
  }
);

// Get all clothing listings for admin
router.get(
  "/clothes",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const clothes = await Clothing.find().sort({
        createdAt: -1,
      });

      res.json({
        success: true,
        data: clothes,
      });
    } catch (error) {
      console.error("Admin clothes error:", error.message);

      res.status(500).json({
        success: false,
        message: "Could not fetch clothing listings.",
      });
    }
  }
);

// Delete a clothing listing as admin
router.delete(
  "/clothes/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid clothing ID.",
        });
      }

      const clothing = await Clothing.findByIdAndDelete(
        req.params.id
      );

      if (!clothing) {
        return res.status(404).json({
          success: false,
          message: "Clothing listing not found.",
        });
      }

      res.json({
        success: true,
        message: "Clothing listing deleted successfully.",
      });
    } catch (error) {
      console.error("Admin delete clothing error:", error.message);

      res.status(500).json({
        success: false,
        message: "Could not delete clothing listing.",
      });
    }
  }
);

// Get all swap requests for admin
router.get(
"/swaps",
authMiddleware,
adminMiddleware,
async (req, res) => {
try {
const swaps = await SwapRequest.find()
.populate("requester", "name email")
.populate("clothing", "title")
.sort({ createdAt: -1 });

  res.json({
    success: true,
    data: swaps,
  });
} catch (error) {
  console.error("Admin swaps error:", error.message);

  res.status(500).json({
    success: false,
    message: "Could not fetch swap requests.",
  });
}

}
);

// Update a swap request status as admin
router.patch(
"/swaps/:id",
authMiddleware,
adminMiddleware,
async (req, res) => {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({
success: false,
message: "Invalid swap request ID.",
});
}

  const { status } = req.body;
  const allowedStatuses = ["Pending", "Accepted", "Rejected", "Cancelled"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid swap request status.",
    });
  }

  const swap = await SwapRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!swap) {
    return res.status(404).json({
      success: false,
      message: "Swap request not found.",
    });
  }

  res.json({
    success: true,
    message: "Swap request status updated successfully.",
    data: swap,
  });
} catch (error) {
  console.error("Admin update swap error:", error.message);

  res.status(500).json({
    success: false,
    message: "Could not update swap request status.",
  });
}

}
);

module.exports = router;