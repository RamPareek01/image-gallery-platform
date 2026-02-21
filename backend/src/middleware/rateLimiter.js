const rateLimit = require("express-rate-limit");

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min per IP
  message: "Too many requests, please try again later",
});

// Strict limiter for uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // only 20 uploads per 15 min
  message: "Upload limit exceeded, please try later",
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many login attempts, try again later",
});

module.exports = {
  apiLimiter,
  uploadLimiter,
  authLimiter,
};