const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

require("dotenv").config({ quiet: true });

const config = require("./config");
const flashMiddleware = require("./middleware/flashMiddleware");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(flashMiddleware);
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.flashError = req.flash("error");
  res.locals.flashSuccess = req.flash("success");
  next();
});

if (!config.mongoUri) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

app.use(authRoutes);
app.use("/post", postRoutes);

app.get("/", (_req, res) => {
  res.redirect("/login");
});

app.use((_req, res) => {
  res.status(404).redirect("/login");
});

app.use((error, req, res, _next) => {
  console.error("Unhandled error:", error.message);
  req.flash("error", "Something went wrong. Please try again.");

  if (req.originalUrl.startsWith("/post")) {
    return res.redirect("/post/feed");
  }

  if (req.originalUrl.startsWith("/signup")) {
    return res.redirect("/signup");
  }

  return res.redirect("/login");
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
