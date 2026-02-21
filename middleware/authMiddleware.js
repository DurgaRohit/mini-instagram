const jwt = require("jsonwebtoken");

const config = require("../config");

module.exports = function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch (_error) {
    return res.redirect("/login");
  }
};
