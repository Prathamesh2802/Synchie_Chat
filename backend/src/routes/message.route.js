import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  clearAllMessage,
  getMessage,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
import { messageRateLimit } from "../middleware/redis.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessage);

// ? Old Route of send message without RateLimit
// router.post("/send/:id", protectRoute, sendMessage);

// ? New Route of send message with Ratelimit
router.post("/send/:id", protectRoute, messageRateLimit, sendMessage);

router.delete("/clear/:id", protectRoute, clearAllMessage);

export default router;
