const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/auth");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /auth/register
router.post("/register", async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ message: "userId and password are required" });
  }

  try {
    const existing = await User.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ userId, passwordHash });
    await user.save();

    const token = signToken(userId);
    res.cookie("bgToken", token, cookieOptions);
    res.status(201).json({ userId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ message: "userId and password are required" });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = signToken(userId);
    res.cookie("bgToken", token, cookieOptions);
    res.json({ userId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /auth/me — returns the logged-in user based on the cookie
router.get("/me", auth, (req, res) => {
  res.json({ userId: req.userId });
});

// POST /auth/logout — clears the cookie
router.post("/logout", (req, res) => {
  res.clearCookie("bgToken", cookieOptions);
  res.json({ message: "Logged out" });
});

module.exports = router;
