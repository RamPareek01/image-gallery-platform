const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

router.get("/protected", protect, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});
router.get("/admin-only", protect, requireAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user,
  });
});

module.exports = router;

