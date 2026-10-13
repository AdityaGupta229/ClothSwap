const mongoose = require("mongoose");

const clothingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    estimatedValue: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    ownerName: {
      type: String,
      required: true,
    },
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    status: {
      type: String,
      enum: ["Available", "Swapped"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Clothing", clothingSchema);