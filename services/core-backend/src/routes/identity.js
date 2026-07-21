import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { users } from "../utils/store.js";

const router = Router();

// All identity routes require authentication
router.use(authenticate);

// ── GET /api/v1/identity/status ──────────────────────────────────────
router.get("/status", (req, res) => {
  try {
    const user = [...users.values()].find(
      (u) => u.id === req.user.sub
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    return res.status(200).json({
      sub: user.id,
      name: user.name,
      email: user.email,
      fan: user.fan,
      kyc_level: user.kycLevel,
      verified: user.kycLevel === "ial2"
    });
  } catch (err) {
    console.error("[Identity] Status error:", err);

    return res.status(500).json({
      message: "Failed to retrieve identity status."
    });
  }
});

// ── GET /api/v1/identity/fan ─────────────────────────────────────────
router.get("/fan", (req, res) => {
  try {
    const user = [...users.values()].find(
      (u) => u.id === req.user.sub
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    return res.status(200).json({
      fan: user.fan
    });
  } catch (err) {
    console.error("[Identity] FAN error:", err);

    return res.status(500).json({
      message: "Failed to retrieve FAN."
    });
  }
});

export default router;