const admin = require("../config/firebase");
const User = require("../models/user.model");

exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify Firebase ID Token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Check if user exists
    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    // If not found, create new user
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || "User",
        role: "user", // default role
      });
    }

    res.status(200).json({
      message: "Login successful",
      token: idToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};