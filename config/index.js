const config = {
  port: Number(process.env.PORT) || 5500,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "secretkey",
  uploadsPerPage: 4,
};

module.exports = config;
