const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
  {
    clothing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clothing",
      required: true,
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SwapRequest", swapRequestSchema);