const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes
likeSchema.index({ user: 1, image: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);