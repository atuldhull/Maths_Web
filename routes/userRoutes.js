import express from "express";
import { getProfile, getUserStats, changePassword } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile",          requireAuth, getProfile);
router.get("/stats",            requireAuth, getUserStats);
router.post("/change-password", requireAuth, changePassword);

export default router;
