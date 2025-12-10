import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  team: { type: Number, enum: [1, 2, 3, 4], required: true },
  totalPoints: { type: Number, default: 0 },
});

export default mongoose.model("User", UserSchema);
