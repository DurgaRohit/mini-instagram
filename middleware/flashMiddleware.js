function parseFlashCookie(rawFlashCookie) {
  if (!rawFlashCookie) return {};

  try {
    const decoded = decodeURIComponent(rawFlashCookie);
    const parsed = JSON.parse(decoded);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (_err) {
    return {};
  }
}

function persistFlashCookie(res, store) {
  const hasMessages = Object.keys(store).length > 0;

  if (!hasMessages) {
    res.clearCookie("flash");
    return;
  }

  res.cookie("flash", encodeURIComponent(JSON.stringify(store)), {
    httpOnly: true,
    sameSite: "lax",
  });
}

module.exports = function flashMiddleware(req, res, next) {
  const flashStore = parseFlashCookie(req.cookies.flash);

  req.flash = (type, message) => {
    if (!type) return null;

    if (typeof message === "undefined") {
      const existing = flashStore[type] || null;
      delete flashStore[type];
      persistFlashCookie(res, flashStore);
      return existing;
    }

    flashStore[type] = message;
    persistFlashCookie(res, flashStore);
    return null;
  };

  next();
};
