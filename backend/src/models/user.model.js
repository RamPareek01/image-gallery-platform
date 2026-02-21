const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: String, // for normal users
    email: { type: String, required: true, unique: true },
    name: String,
    password: String, // for admin login
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);