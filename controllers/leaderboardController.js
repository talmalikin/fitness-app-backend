import User from "../models/User.js";

// משתנה גלובלי לשמירת מצב הלידרבורד
let leaderboardVisible = true; // ברירת מחדל – תמיד גלוי לכל המשתמשים

// --- Toggle Leaderboard ---
// מנהל יכול לפתוח/לסגור את הלידרבורד
// export const toggleLeaderboard = (req, res) => {
//   leaderboardVisible = !leaderboardVisible;
//   res.json({ leaderboardVisible });
// };

// --- Leaderboard אישי לפי משתמשים ---
// --- Leaderboard אישי לפי משתמשים כולל teamNumber ---
export const getLeaderboard = async (req, res) => {
  try {
    if (!leaderboardVisible) {
      return res.status(403).json({ message: "Leaderboard לא זמין כרגע" });
    }

    // שליפת כל המשתמשים שהם לא מנהלים כולל teamNumber
    const users = await User.find({ role: "user" }).select(
      "name totalPoints teamNumber"
    );

    // מיפוי למבנה אחיד ומיון לפי score
    const sortedLeaderboard = users
      .map((u) => ({
        name: u.name,
        score: u.totalPoints,
        teamNumber: u.teamNumber ?? null, // אם אין קבוצת משתמש, שים null
        _id: u._id, // חשוב ל־React key
      }))
      .sort((a, b) => b.score - a.score);

    return res.json(sortedLeaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "שגיאה בלידרבורד אישי" });
  }
};

export const getTeamLeaderboard = async (req, res) => {
  try {
    // 1️⃣ סיכום נקודות לפי קבוצה
    const teamsFromDb = await User.aggregate([
      { $match: { role: "user", team: { $in: [1, 2, 3, 4,5] } } }, // סנן לפי הקבוצות החוקיות
      {
        $group: {
          _id: "$team", // קיבוץ לפי שדה team
          totalPoints: { $sum: "$totalPoints" }, // סכום הנקודות
        },
      },
      { $sort: { totalPoints: -1 } },
      {
        $project: {
          teamNumber: "$_id", // הפוך לשם ברור
          score: "$totalPoints",
          _id: 0,
        },
      },
    ]);

    // 2️⃣ ודא שיש תמיד 4 קבוצות
    const allTeams = [1, 2, 3, 4,5];
    const leaderboard = allTeams.map((teamNum) => {
      const team = teamsFromDb.find((t) => t.teamNumber === teamNum);
      return {
        teamNumber: teamNum,
        score: team ? team.score : 0,
      };
    });

    return res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "שגיאה בלידרבורד קבוצות" });
  }
};
