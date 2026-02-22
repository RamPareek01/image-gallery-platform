require("dotenv").config();
const env = require("./config/env");
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const testRoute = require("./routes/testRoute");
const userRoutes = require("./routes/user.routes");
const imageRoutes = require("./routes/image.routes");
const errorHandler = require("./middleware/errorMiddleware");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const adminAuthRoutes = require("./routes/adminAuth.routes");

const app = express();
app.set("trust proxy", 1);

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminAuthRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(apiLimiter);
}

app.get("/", (req, res) => {
  res.send("Backend running...");
});


app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/test", testRoute);
app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});