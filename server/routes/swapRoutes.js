const express = require("express");
const mongoose = require("mongoose");
const SwapRequest = require("../models/SwapRequest");
const Clothing = require("../models/Clothing");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Create a swap request
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { clothingId, requesterName, message } = req.body;

    if (
      !mongoose.isValidObjectId(clothingId) ||
      typeof requesterName !== "string" ||
      !requesterName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid clothing ID and requester name are required.",
      });
    }

    const clothing = await Clothing.findById(clothingId);

    if (!clothing) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    if (clothing.status !== "Available") {
      return res.status(409).json({
        success: false,
        message: "This clothing item is no longer available.",
      });
    }

    const swapRequest = await SwapRequest.create({
      clothing: clothing._id,
      requester: req.userId,
      requesterName: requesterName.trim(),
      message: typeof message === "string" ? message.trim() : "",
    });

    res.status(201).json({
      success: true,
      data: swapRequest,
    });
  } catch (error) {
    console.error("CREATE SWAP ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create swap request.",
    });
  }
});

// Get only the logged-in user's swap requests
router.get("/", authMiddleware, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      requester: req.userId,
    })
      .populate("clothing")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("FETCH SWAPS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch swap requests.",
    });
  }
});
// Get incoming swap requests for clothes owned by the logged-in user
router.get("/incoming", authMiddleware, async (req, res) => {
  try {
    const myClothes = await Clothing.find({
      owner: req.userId,
    }).select("_id");

    const clothingIds = myClothes.map((item) => item._id);

    const requests = await SwapRequest.find({
      clothing: { $in: clothingIds },
    })
      .populate("clothing")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("FETCH INCOMING SWAPS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch incoming swap requests.",
    });
  }
});

// Accept an incoming swap request
router.patch("/:id/accept", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid swap request ID.",
      });
    }

    const request = await SwapRequest.findById(req.params.id)
      .populate("clothing");

    if (!request || !request.clothing) {
      return res.status(404).json({
        success: false,
        message: "Swap request or clothing not found.",
      });
    }

    const clothing = request.clothing;

    if (String(clothing.owner) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the clothing owner can accept this request.",
      });
    }

    if (request.status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending requests can be accepted.",
      });
    }

    if (clothing.status !== "Available") {
      return res.status(409).json({
        success: false,
        message: "This clothing item is no longer available.",
      });
    }

    // Mark the selected request as accepted
    request.status = "Accepted";
    await request.save();

    // Mark the clothing as swapped
    clothing.status = "Swapped";
    await clothing.save();

    // Reject all other pending requests for this clothing
    await SwapRequest.updateMany(
      {
        clothing: clothing._id,
        _id: { $ne: request._id },
        status: "Pending",
      },
      {
        $set: { status: "Rejected" },
      }
    );

    res.json({
      success: true,
      message: "Swap request accepted successfully.",
      data: request,
    });
  } catch (error) {
    console.error("ACCEPT SWAP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to accept swap request.",
    });
  }
});

// Reject an incoming swap request
router.patch("/:id/reject", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid swap request ID.",
      });
    }

    const request = await SwapRequest.findById(req.params.id)
      .populate("clothing");

    if (!request || !request.clothing) {
      return res.status(404).json({
        success: false,
        message: "Swap request or clothing not found.",
      });
    }

    if (String(request.clothing.owner) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the clothing owner can reject this request.",
      });
    }

    if (request.status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending requests can be rejected.",
      });
    }

    request.status = "Rejected";
    await request.save();

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("REJECT SWAP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject swap request.",
    });
  }
});

// Cancel a pending request owned by the logged-in user
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid swap request ID.",
      });
    }

    const request = await SwapRequest.findOne({
      _id: req.params.id,
      requester: req.userId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found.",
      });
    }

    if (request.status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending requests can be cancelled.",
      });
    }

    request.status = "Cancelled";
    await request.save();

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("CANCEL SWAP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel swap request.",
    });
  }
});

module.exports = router;