import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateprofilepic,
  searchUsers,
  verifyOtp,
  resendOtp,
  updateDetails,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { RateLimitLogin } from "../middleware/redis.middleware.js";

const router = express.Router();

router.post("/signup", signup);

// ? old login without ratelimit
// router.post("/login", login);

// ? New Login with RateLimit
router.post("/login", RateLimitLogin, login);

router.post("/logout", logout);

router.put("/updateprofilepic", protectRoute, updateprofilepic);

router.put("/updatedetails", protectRoute, updateDetails);

router.get("/checkAuth", protectRoute, checkAuth);

router.get("/users/search", protectRoute, searchUsers);

// New Routes for OTP Verification and Resend otp

router.post("/verify-otp", verifyOtp);

router.post("/resend-otp", resendOtp);

// Routes for Forgot Password and OTp and Password verify and password change

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

export default router;
