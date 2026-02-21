const express = require("express");
const router = express.Router();

const {
  adminLogin,
  createAdmin
} = require("../controllers/adminAuth.controller");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

router.post("/login", adminLogin);
router.post("/create", protect, requireAdmin, createAdmin);

module.exports = router;