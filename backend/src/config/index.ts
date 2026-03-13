import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  nasa: {
    apiKey: process.env.NASA_API_KEY || "DEMO_KEY",
    baseUrl: process.env.NASA_API_BASE_URL || "https://api.nasa.gov",
  },
  isProduction: process.env.NODE_ENV === "production",
};
