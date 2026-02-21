const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const Post = require("../models/post");
const config = require("../config");
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { cleanText, hasValue, parsePage } = require("../utils/validators");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      callback(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

router.get("/create", auth, (_req, res) => {
  res.render("create");
});

router.post(
  "/create",
  auth,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const caption = cleanText(req.body.caption);

    if (!hasValue(caption) || !req.file) {
      req.flash("error", "Caption and image are required.");
      return res.redirect("/post/create");
    }

    await Post.create({
      caption,
      image: req.file.filename,
      user: req.user.id,
    });

    req.flash("success", "Post created successfully.");
    return res.redirect("/post/feed");
  })
);

router.get(
  "/feed",
  auth,
  asyncHandler(async (req, res) => {
    const currentPage = parsePage(req.query.page);
    const limit = config.uploadsPerPage;
    const skip = (currentPage - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find()
        .populate("user")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalPosts / limit) || 1;

    res.render("feed", {
      posts,
      currentPage,
      totalPages,
      userId: req.user.id,
    });
  })
);

router.get(
  "/delete/:id",
  auth,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash("error", "Post not found.");
      return res.redirect("/post/feed");
    }

    if (post.user.toString() !== req.user.id) {
      req.flash("error", "Unauthorized action.");
      return res.redirect("/post/feed");
    }

    await Post.findByIdAndDelete(req.params.id);

    req.flash("success", "Post deleted successfully.");
    return res.redirect("/post/feed");
  })
);

module.exports = router;
