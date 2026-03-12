import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import logger from "./logger";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: frontendOrigin,
  }),
);
app.use(compression());
app.use(express.json());

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "backend",
  });
});

app.listen(port, "0.0.0.0", () => {
  logger.info(`Backend listening on http://0.0.0.0:${port}`);
});
