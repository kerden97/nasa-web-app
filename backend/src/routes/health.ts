import { Router } from "express";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "backend" });
});

export default router;
