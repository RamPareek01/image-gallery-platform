const { cleanEnv, str, port } = require("envalid");

const env = cleanEnv(process.env, {
  PORT: port({ default: 5000 }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),
  FIREBASE_SERVICE_ACCOUNT: str(), 
});

module.exports = env;