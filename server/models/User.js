const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},
location: {
  city: {
    type: String,
    trim: true,
    default: "",
  },
  state: {
    type: String,
    trim: true,
    default: "",
  },
},
 
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);