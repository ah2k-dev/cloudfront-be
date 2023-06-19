const jwt = require("jsonwebtoken");
const User = require("../models/User/user");
const dotenv = require("dotenv");

dotenv.config({ path: ".././src/config/config.env" });

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    console.log(token);
    if (!token) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role == "admin") {
    res.status(403).json({
      success: false,
      message: "You are not authendicated as admin",
    });
  }
  next();
};

const investorAuth = (req, res, next) => {
  if (!req.user.role == "investor") {
    res.status(403).json({
      success: false,
      message: "You are not authendicated as investor",
    });
  }
  next();
};

const creatorAuth = (req, res, next) => {
  console.log(req.user.role);
  if (!req.user.role == "creator") {
    res.status(403).json({
      success: false,
      message: "You are not authenticated as creator",
    });
  }
  next();
};

module.exports = { isAuthenticated, adminAuth, creatorAuth, investorAuth };
