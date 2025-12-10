import express from "express";
import {
  getUserById,
  getAllUsers,
  getUserTotalPoints,
  getTopUserPerTeam,
} from "../controllers/userController.js";

const router = express.Router();

// שליפת משתמש לפי ID

// שליפת כל המשתמשים
router.get("/", getAllUsers);

// שליפת נקודות משתמש (דרך query param ?userId=)
router.get("/points", getUserTotalPoints);

router.get("/topusers", getTopUserPerTeam);

router.get("/:id", getUserById);

export default router;
