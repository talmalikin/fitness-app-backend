import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron"; // 1. ייבוא ה-Cron

// ייבוא מודל המשתמש (כדי שנוכל לאפס את הנקודות)
// 🛑 וודא שהנתיב הזה נכון לקובץ ה-User שלך
import User from "./models/User.js";
import Workout from "./models/Workout.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import workoutRoutes from "./routes/workout.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import settingsRoutes from "./routes/settings.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173", // הכתובת לפיתוח במחשב שלך
      "https://pakal.online",
      "https://www.pakal.online",
    ],
    credentials: true, // מאפשר העברת קוקיז וטוקנים
  })
);
app.use(express.json());

// חיבור למסד נתונים
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

cron.schedule(
  "0 0 * * 5",
  async () => {
    console.log("⏰ Weekly Reset: Starting scheduled task...");

    try {
      // מאפס את totalPoints ל-0 עבור כל המשתמשים במערכת
      const result = await User.updateMany(
        {},
        {
          $set: { totalPoints: 0 },
        }
      );

      console.log(
        `✅ Success: Reset scores for ${result.modifiedCount} users.`
      );
    } catch (error) {
      console.error("❌ Error during weekly reset:", error);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Jerusalem", // חשוב מאוד כדי שיתאפס בחצות ישראל ולא לונדון
  }
);
// ---------------------------------------------------------

// Routes
app.use("/auth", authRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/users", userRoutes);
app.use("/workout", workoutRoutes);
app.use("/settings", settingsRoutes);




app.get('/fix-all-points', async (req, res) => {
  try {
    const users = await User.find({});
    let updateCount = 0;

    for (const user of users) {
      const workouts = await Workout.find({ user: user._id });
      
      let calculatedPoints = 0;

      for (const w of workouts) {
        const pullupsPoints = Math.floor((w.exercises.pullups || 0) / 10);
        const pushupsPoints = Math.floor((w.exercises.pushups || 0) / 10);
        
        const runningPoints = Math.floor((w.exercises.running || 0) / 1) * 2; 

        calculatedPoints += (pullupsPoints + pushupsPoints + runningPoints);
      }

      user.totalPoints = calculatedPoints;
      user.score = calculatedPoints; 
      await user.save();
      updateCount++;
    }

    res.send(`✅ סיימתי! תוקן הניקוד ל-${updateCount} משתמשים לפי החוקים החדשים.`);
  } catch (err) {
    console.error(err);
    res.status(500).send("שגיאה בתיקון הנתונים: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
// בדיקת בריאות לשרת (כדי ש-UptimeRobot יראה ירוק)
app.get("/", (req, res) => {
  res.send("Fitness App Server is Running!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
