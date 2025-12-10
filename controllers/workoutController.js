import Workout from "../models/Workout.js";
import User from "../models/User.js";

const TYPE_MAPPING = {
  climb: "pullups",
  run: "running",
  up_down: "pushups",
};

// POINTS_MAPPING הוסר, כי כעת אנו משתמשים במחלקים שלמים

/**
 * פונקציית עזר: קובעת את המחלק הדרוש לחישוב נקודות שלמות.
 * (כלומר, כמה יחידות צריך כדי לקבל נקודה אחת).
 * @param {string} exercise - שם התרגיל (climb, run, up_down).
 * @returns {number} - המחלק (10 או 1).
 */
const getUnitsPerPoint = (exercise) => {
  switch (exercise) {
    case "climb":
    case "up_down":
      // 10 יחידות = 1 נקודה
      return 10;
    case "run":
      // 1 ק"מ = 1 נקודה
      return 1;
    default:
      return 1; // ברירת מחדל בטוחה
  }
};

// 🔹 עדכון אימון
export const updateActivity = async (req, res) => {
  try {
    const { userId, exercise, amount } = req.body;
    const dbField = TYPE_MAPPING[exercise];

    // קביעת המחלק הנדרש
    const unitsPerPoint = getUnitsPerPoint(exercise);

    if (!dbField) return res.status(400).json({ message: "תרגיל לא חוקי" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let workout = await Workout.findOne({
      user: userId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!workout) {
      workout = new Workout({
        user: userId,
        date: todayStart,
        exercises: { pullups: 0, pushups: 0, running: 0 },
      });
    }

    // 1. שמירת סך התרגיל הנוכחי (לפני העדכון)
    const oldAmount = workout.exercises[dbField] || 0;

    // 2. חישוב סך הנקודות הקודם (מספר שלם)
    // 19 מתח -> Math.floor(19 / 10) = 1 נקודה
    const oldTotalPointsAwarded = Math.floor(oldAmount / unitsPerPoint);

    // בדיקה שלא יורד מתחת ל-0
    if (amount < 0 && oldAmount + amount < 0) {
      return res.status(400).json({ message: "לא ניתן לרדת מתחת ל-0" });
    }

    // 3. עדכון סך התרגיל באימון
    workout.exercises[dbField] = oldAmount + amount;

    // 4. שמירת האימון המעודכן
    await workout.save();

    // 5. סך התרגיל החדש
    const newAmount = workout.exercises[dbField];

    // 6. חישוב סך הנקודות החדש (מספר שלם)
    // 20 מתח -> Math.floor(20 / 10) = 2 נקודות
    const newTotalPointsAwarded = Math.floor(newAmount / unitsPerPoint);

    // 7. השינוי נטו בנקודות (מספר שלם)
    // אם עברנו מ-19 ל-20 מתח, השינוי הוא: 2 - 1 = 1 נקודה
    const pointsChange = newTotalPointsAwarded - oldTotalPointsAwarded;

    // 8. עדכון נקודות המשתמש
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { totalPoints: pointsChange } },
      { new: true }
    );

    res.json({ workout, totalPoints: updatedUser.totalPoints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
};

// 🔹 אימון של היום למשתמש
export const getUserWorkouts = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const workout = await Workout.findOne({
      user: userId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!workout) {
      return res.json({
        exercises: { pullups: 0, pushups: 0, running: 0 },
      });
    }

    res.json({ exercises: workout.exercises });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 כל האימונים של משתמש
export const getAllUserWorkouts = async (req, res) => {
  try {
    const { userId } = req.params;
    const workouts = await Workout.find({ user: userId }).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "שגיאה בשליפת האימונים" });
  }
};
