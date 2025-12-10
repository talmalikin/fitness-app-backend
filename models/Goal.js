import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: String,
  target: Number,
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

export default mongoose.model("Goal", GoalSchema);
