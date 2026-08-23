import User from "../models/User.js";
import Workout from "../models/Workout.js"; // רק אם צריך לשלוף אימונים

// 🔹 שליפת משתמש לפי ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "משתמש לא נמצא" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
};

// 🔹 שליפת כל המשתמשים
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
};

// 🔹 שליפת סך הנקודות של משתמש
export const getUserTotalPoints = async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "משתמש לא נמצא" });

    res.json({ totalPoints: user.totalPoints });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בקבלת נקודות" });
  }
};

// מציאת המשתמש המצטיין מכל קבוצה
export const getTopUserPerTeam = async (req, res) => {
  try {
    // מערך עם 4 קבוצות
    const teams = [5, 6, 7, 8,9];

    // מציאת המשתמש המוביל בכל קבוצה
    const topUsers = await Promise.all(
      teams.map(async (teamNum) => {
        const topUser = await User.find({ team: teamNum, role: "user" })
          .sort({ totalPoints: -1 }) // מיון מהגבוה לנמוך
          .limit(1) // לוקח את הראשון
          .select("name team totalPoints"); // שולח רק את השדות הרלוונטיים
        return topUser[0] || null; // אם אין משתמש בקבוצה, מחזיר null
      })
    );

    res.json(topUsers); // מערך של 4 משתמשים או null אם קבוצה ריקה
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "שגיאה במציאת המצטיינים לכל קבוצה" });
  }
};
