import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";

import {
  AcceptFriendRequest,
  RejectFriendRequest,
  CancelFriendRequest,
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  unfriend,
  getBlockedUsers,
  blockUser,
  unblockUser,
  getSentRequests,
} from "../controllers/friends.controller.js";

const router = express.Router();

router.post("/request/:id", protectRoute, sendFriendRequest);

router.patch("/request/:id/accept", protectRoute, AcceptFriendRequest);

router.delete("/request/:id/reject", protectRoute, RejectFriendRequest);

router.delete("/request/:id/cancel", protectRoute, CancelFriendRequest);

router.get("/requests/pending/incoming", protectRoute, getPendingRequests);

router.get("/requests/pending/sent", protectRoute, getSentRequests);

router.get("/friends", protectRoute, getFriends);

router.delete("/unfriend/:userId", protectRoute, unfriend);

router.post("/block/:userId", protectRoute, blockUser);

router.delete("/unblock/:userId", protectRoute, unblockUser);

router.get("/blocks/blocked", protectRoute, getBlockedUsers);

export default router;
