import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const view = (name) => path.join(__dirname, "../views", name + ".html");

/* ── Public pages ── */
router.get(["/", "/home", "/index"], (req, res) => res.sendFile(view("home")));
router.get("/about",     (req, res) => res.sendFile(view("about")));
router.get("/contact",   (req, res) => res.sendFile(view("contact")));
router.get("/privacy",   (req, res) => res.sendFile(view("privacy")));
router.get("/terms",     (req, res) => res.sendFile(view("terms")));
router.get("/events",    (req, res) => res.sendFile(view("events")));
router.get("/gallery",   (req, res) => res.sendFile(view("gallery")));
router.get("/history",   (req, res) => res.sendFile(view("history")));

/* ── Auth pages ── */
router.get("/login",     (req, res) => res.sendFile(view("login")));
router.get("/register",  (req, res) => res.sendFile(view("register")));

/* ── Protected pages (frontend handles auth) ── */
router.get("/arena",        (req, res) => res.sendFile(view("arena")));
router.get("/dashboard",    (req, res) => res.sendFile(view("dashboard")));
router.get("/profile",      (req, res) => res.sendFile(view("profile")));
router.get("/tests",        (req, res) => res.sendFile(view("tests")));
router.get("/projects",     (req, res) => res.sendFile(view("projects")));
router.get("/certificates", (req, res) => res.sendFile(view("certificates")));
router.get("/winners",      (req, res) => res.sendFile(view("winners")));
router.get("/admin",        (req, res) => res.sendFile(view("admin")));
router.get("/teacher",      (req, res) => res.sendFile(view("teacher")));
router.get("/ml-launchpad", (req, res) => res.sendFile(view("ml-launchpad")));
router.get("/ml",           (req, res) => res.redirect(301, "/ml-launchpad")); // alias to fix short links
router.get("/live-quiz", (req, res) => res.sendFile(view("live-quiz")));
router.get("/quiz-play", (req, res) => res.sendFile(view("quiz-play")));
router.get("/super-admin",  (req, res) => res.sendFile(view("super-admin")));
router.get("/billing",      (req, res) => res.sendFile(view("billing")));

export default router;
