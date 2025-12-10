import express from "express";
import {
  toggleLeaderboard,
  getLeaderboardVisibility,
} from "../controllers/settingsController.js";

const router = express.Router();

router.patch("/toggle", toggleLeaderboard);

router.get("/visibility", getLeaderboardVisibility);

export default router;
