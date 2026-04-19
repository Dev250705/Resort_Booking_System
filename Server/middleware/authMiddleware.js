const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const raw = process.env.JWT_SECRET;
  if (raw == null || raw === "") return "";
  return String(raw).trim();
}

function authMiddleware(req, res, next) {
  const secret = getJwtSecret();
  if (!secret) {
    console.error("[auth] JWT_SECRET is missing — add it to Server/.env and restart the server.");
    return res.status(500).json({
      message: "Server misconfiguration: JWT_SECRET is not set",
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const trimmed = authHeader.trim();
  const parts = trimmed.split(/\s+/);
  const token =
    parts.length === 2 && parts[0].toLowerCase() === "bearer"
      ? parts[1].trim()
      : trimmed.startsWith("Bearer ")
        ? trimmed.slice(7).trim()
        : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authMiddleware, getJwtSecret };
