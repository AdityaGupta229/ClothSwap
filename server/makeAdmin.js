require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "ram@gmail.com"
      .trim()
      .toLowerCase();

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log("Account not found. Sign up first with this email.");
      return;
    }

    console.log(`Admin role assigned to: ${user.email}`);
  } catch (error) {
    console.error("Could not assign admin role:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin();