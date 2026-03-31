import express from "express";
import {
  getEvents, getEvent, createEvent, updateEvent,
  deleteEvent, toggleRegistration,
  getSiteSettings, updateSiteSetting,
} from "../controllers/eventcontrollers.js";
import { requireAuth, requireAdmin, requireTeacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/",                       getEvents);
router.get("/settings",               getSiteSettings);          // used by register page to check if open
router.get("/:id",                    getEvent);

// Teacher / Admin
router.post("/",                      requireTeacher, createEvent);
router.patch("/:id",                  requireTeacher, updateEvent);
router.delete("/:id",                 requireTeacher, deleteEvent);
router.patch("/:id/toggle-reg",       requireTeacher, toggleRegistration);

// Admin only — site-wide settings
router.patch("/settings/:key",        requireAdmin, updateSiteSetting);

export default router;