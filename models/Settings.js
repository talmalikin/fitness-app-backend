import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  leaderboardVisible: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Settings", SettingsSchema);
