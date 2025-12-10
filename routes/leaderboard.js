import express from "express";
import {
  getLeaderboard,
  getTeamLeaderboard,
} from "../controllers/leaderboardController.js";

const router = express.Router();

// נוודא שמשתמש מנהל
const isAdmin = (req, res, next) => {
  const user = req.user; // אם אין JWT, אפשר לעבור דרך localStorage בצד לקוח
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// נתיב אישי – כל המשתמשים (לכל המשתמשים לראות)
router.get("/personal", getLeaderboard);

router.get("/group", getTeamLeaderboard);

export default router;
