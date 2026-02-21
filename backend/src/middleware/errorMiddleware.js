const errorHandler = (err, req, res, next) => {
  console.error("Global Error:", err);

  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;