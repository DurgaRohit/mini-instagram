function cleanText(value) {
  return (value || "").trim();
}

function hasValue(value) {
  return cleanText(value).length > 0;
}

function parsePage(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

module.exports = {
  cleanText,
  hasValue,
  parsePage,
};
