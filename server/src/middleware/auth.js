import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    //  Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    //  No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — Token missing. Please log in.",
      });
    }

    //  Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Fetch the user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found — Account may have been deleted.",
      });
    }

    // Attach user object for later middlewares/controllers
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    //  Handle specific JWT errors — expired token or invalid token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired — Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token — Please log in again.",
      });
    }

    //  Catch-all
    return res.status(401).json({
      success: false,
      message: "Not authorized — Token verification failed.",
    });
  }
};
