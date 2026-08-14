const dotenv = require("dotenv");

dotenv.config();

const requiredEnvVariables = [
  "PORT",
  "MONGO_URI",
  "FRONTEND_URL"
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

const env = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  frontendUrl: process.env.FRONTEND_URL
};

module.exports = env;
