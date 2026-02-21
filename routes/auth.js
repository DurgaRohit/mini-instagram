const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const config = require("../config");
const asyncHandler = require("../utils/asyncHandler");
const { cleanText, hasValue } = require("../utils/validators");

const router = express.Router();

router.get("/signup", (_req, res) => {
  res.render("signup");
});

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const username = cleanText(req.body.username);
    const email = cleanText(req.body.email).toLowerCase();
    const password = cleanText(req.body.password);

    if (!hasValue(username) || !hasValue(email) || !hasValue(password)) {
      req.flash("error", "All fields are required.");
      return res.redirect("/signup");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered.");
      return res.redirect("/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    req.flash("success", "Signup successful. Please login.");
    return res.redirect("/login");
  })
);

router.get("/login", (_req, res) => {
  res.render("login");
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = cleanText(req.body.email).toLowerCase();
    const password = cleanText(req.body.password);

    if (!hasValue(email) || !hasValue(password)) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/login");
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/login");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      req.flash("error", "Wrong password.");
      return res.redirect("/login");
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      config.jwtSecret
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    req.flash("success", "Welcome back.");
    return res.redirect("/post/feed");
  })
);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.flash("success", "Logged out successfully.");
  res.redirect("/login");
});

module.exports = router;
