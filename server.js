import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("./")); // serve frontend files

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://sa0653286:sa0653286@cluster0.mongodb.net/chatflow", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

// ✅ Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// ✅ Signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.json({ success: false, message: "All fields required!" });

  const existing = await User.findOne({ email });
  if (existing) return res.json({ success: false, message: "Email already registered!" });

  const newUser = new User({ username, email, password });
  await newUser.save();
  res.json({ success: true, message: "Account created successfully!" });
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: "No account found!" });
  if (user.password !== password) return res.json({ success: false, message: "Invalid password!" });

  res.json({ success: true, message: "Login successful!", user });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
