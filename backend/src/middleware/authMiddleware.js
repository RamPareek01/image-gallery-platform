const jwt = require("jsonwebtoken");
const admin = require("../config/firebase");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    /* ===== Try JWT (Admin) ===== */
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);

      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      console.log("JWT failed, trying Firebase...");
    }

    /* ===== Try Firebase ===== */
    const decodedFirebase = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({
      firebaseUid: decodedFirebase.uid,
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("Auth Error:", error.message);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = protect;