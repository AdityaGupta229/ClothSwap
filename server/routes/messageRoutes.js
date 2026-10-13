const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");
const Clothing = require("../models/Clothing");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/test", (req, res) => {
    console.log("message get route hit",req.params.swapId);
  res.json({ success: true, message: "Message route working!" });
});

// Verify that the logged-in user is a participant in this swap
async function getAuthorizedSwap(swapId, userId) {
if (!mongoose.isValidObjectId(swapId)) return null;

const swap = await SwapRequest.findById(swapId).populate("clothing");

if (!swap || !swap.clothing) return null;

// Chat is available only after the swap is accepted.
if (swap.status !== "Accepted") return null;

const clothing = swap.clothing;

const isRequester =
swap.requester.toString() === userId.toString();

const isOwner =
clothing.owner &&
clothing.owner.toString() === userId.toString();

if (!isRequester && !isOwner) return null;

return swap;
}

// Get messages for one swap
router.get("/:swapId", authMiddleware, async (req, res) => {
  try {
    const swap = await getAuthorizedSwap(req.params.swapId, req.userId);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found or access denied.",
      });
    }

    const messages = await Message.find({
      swapRequest: swap._id,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("FETCH MESSAGES ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not fetch messages.",
    });
  }
});

// Send a message in one swap
router.post("/:swapId", authMiddleware, async (req, res) => {
  try {
    const swap = await getAuthorizedSwap(req.params.swapId, req.userId);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found or access denied.",
      });
    }

    if (["Rejected", "Cancelled"].includes(swap.status)) {
      return res.status(409).json({
        success: false,
        message: "Chat is unavailable for this request status.",
      });
    }

    if (typeof req.body.text !== "string" || !req.body.text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    const user = await User.findById(req.userId).select("name");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    const message = await Message.create({
      swapRequest: swap._id,
      sender: user._id,
      senderName: user.name,
      text: req.body.text.trim().slice(0, 1000),
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not send message.",
    });
  }
});

module.exports = router;