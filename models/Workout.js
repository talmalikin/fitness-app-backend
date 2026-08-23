import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
  exercises: {
    pushups: { type: Number, default: 0 },
    running: { type: Number, default: 0 }, // קילומטרים
  },
  notes: String,
});

export default mongoose.model("Workout", WorkoutSchema);
