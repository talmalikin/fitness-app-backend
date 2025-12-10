import express from "express";
import {
  updateActivity,
  getUserWorkouts,
  getAllUserWorkouts,
} from "../controllers/workoutController.js";

const router = express.Router();

// עדכון אימון
router.post("/update", updateActivity);

// אימון של היום למשתמש
router.get("/todayworkout", getUserWorkouts);

// כל האימונים של משתמש לפי userId
router.get("/user/:userId", getAllUserWorkouts);

export default router;
