import Settings from "../models/Settings.js"; // <--- ודא שהנתיב נכון

export const toggleLeaderboard = async (req, res) => {
  const settings = await Settings.findOne();
  settings.leaderboardVisible = !settings.leaderboardVisible;
  await settings.save();

  res.json({ leaderboardVisible: settings.leaderboardVisible });
};

export const getLeaderboardVisibility = async (req, res) => {
  const settings = await Settings.findOne();

  // שולח תגובת JSON שמכילה את הערך הנוכחי של leaderboardVisible
  res.json({ leaderboardVisible: settings.leaderboardVisible });
};

export const getSettings = (req, res) => {};
