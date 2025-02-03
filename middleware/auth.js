const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware xác thực token
exports.authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token required" });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware kiểm tra vai trò
exports.authorizeRole = (roles) => (req, res, next) => {
  // Nếu roles không được truyền, trả lỗi
  if (!roles || roles.length === 0) {
    return res
      .status(400)
      .json({ message: "Roles must be specified for authorization" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};
