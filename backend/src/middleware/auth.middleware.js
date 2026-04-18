import { User } from "../models/users.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(400).json({ message: "Invalid Auth" });
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid User" });
    }
    const user = await User.findById(decoded.userid).select("-password");
    if (!user) return res.status(400).json({ message: "user not found" });
    req.user = user;
    next();
  } catch (ex) {
    res.status(400).json({ message: ex.message });
  }
};
