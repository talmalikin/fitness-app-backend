import User from "../models/User.js";

// הרשמה
export const register = async (req, res) => {
  try {
    const { name, password, team } = req.body;

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // בדיקה אם הקבוצה תקינה
    if (![1, 2, 3, 4,5].includes(team)) {
      return res.status(400).json({ message: "Invalid team number" });
    }

    // יצירת משתמש חדש
    const user = new User({
      name,
      password,
      team,
      role: "user",
      totalPoints: 0,
    });

    await user.save();

    res.json({ message: "User registered", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({ name, password }); // עדיף bcrypt
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Logged in", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
