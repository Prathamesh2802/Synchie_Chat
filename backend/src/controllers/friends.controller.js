import { Relationship } from "../models/relationship.model.js";
import { Block } from "../models/block.models.js";
import { User } from "../models/users.js";

// Importing getReceiverSocketId and socketid from config
import { getReceiverSocketId } from "../config/socket.js";
import { io } from "../config/socket.js";

const sendFriendRequest = async (req, res) => {
  try {
    const requester = req.user._id;
    const recipient = req.params.id;

    // Check if the request you are sending is for yourself
    if (requester === recipient)
      return res
        .status(400)
        .json({ message: "You cannot send friend request to yourself" });

    // Check if the user is blocked if yes he cannot send requests

    const blockedUser = await Block.findOne({
      $or: [
        { blocker: requester, blocked: recipient },
        { blocker: recipient, blocked: requester },
      ],
    });

    if (blockedUser)
      return res.status(400).json({
        message: "Cannot send request user is not accepting requests",
      });

    // Check if the request is already sent or are they already friends

    const checkFriendRequestStatus = await Relationship.findOne({
      $or: [
        { requester, recipient },
        { requester: recipient, recipient: requester },
      ],
    });

    if (checkFriendRequestStatus)
      return res.status(400).json({ message: "Friend Request already sent" });

    const newFriendRequest = new Relationship({
      requester,
      recipient,
      status: "pending",
    });

    await newFriendRequest.save();

    // Added Socket For Send Friend Request user status update without refreshing frontend for receiver side
    const receiverSocketId = getReceiverSocketId(recipient);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestReceived");
    }

    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: "Error Occurred" });
  }
};

const AcceptFriendRequest = async (req, res) => {
  try {
    // check if the request id record is blank or present in table
    const id = req.params.id;
    if (!id) return res.status(401).json({ message: "Invalid Id" });
    const checkRequestExist = await Relationship.findById(id);
    if (!checkRequestExist)
      return res.status(401).json({ message: "Invalid Id" });

    // now check if the id is similar to the receipient id if not pass unauthorised status

    if (checkRequestExist.recipient.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorised" });

    checkRequestExist.status = "accepted";
    await checkRequestExist.save();

    // Added Socket For Accept Friend Request user status update without refreshing frontend for sender side

    const receiverSocketId = getReceiverSocketId(checkRequestExist.requester);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestAccepted");
    }

    res.status(201).json({ message: "Friend Request Accepted" });
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ message: "Error occurred" });
  }
};

const RejectFriendRequest = async (req, res) => {
  try {
    // check if the request id record is blank or present in table
    const id = req.params.id;
    if (!id) return res.status(401).json({ message: "Invalid Id" });
    const checkRequestExist = await Relationship.findById(id);
    if (!checkRequestExist)
      return res.status(401).json({ message: "Invalid Id" });

    // now check if the id is similar to the receipient id if not pass unauthorised status

    if (checkRequestExist.recipient.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorised" });

    await checkRequestExist.deleteOne();

    // Added Socket For Reject Friend Request user status update without refreshing frontend for sender side

    const receiverSocketId = getReceiverSocketId(checkRequestExist.requester);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestRejected");
    }

    res.status(200).json({ message: "Friend Request rejected successfully" });
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ message: "Error occurred" });
  }
};

const CancelFriendRequest = async (req, res) => {
  try {
    // check if the request id record is blank or present in table
    const id = req.params.id;
    if (!id) return res.status(401).json({ message: "Invalid Id" });
    const checkRequestExist = await Relationship.findById(id);
    if (!checkRequestExist)
      return res.status(401).json({ message: "Invalid Id" });

    // now check if the id is similar to the receipient id if not pass unauthorised status

    if (checkRequestExist.requester.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorised" });

    await checkRequestExist.deleteOne();

    // Added Socket For Cancel Friend Request user status update without refreshing frontend for receiver side

    const receiverSocketId = getReceiverSocketId(checkRequestExist.recipient);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestCancelled");
    }

    res.status(200).json({ message: "Friend Request cancelled successfully" });
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ message: "Error occurred" });
  }
};

/*
 GET PENDING REQUESTS Incoming
*/
const getPendingRequests = async (req, res) => {
  try {
    const requests = await Relationship.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("requester", "-email -password");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
Get PENDING REQUESTS Sent
*/

const getSentRequests = async (req, res) => {
  try {
    const requests = await Relationship.find({
      requester: req.user._id,
      status: "pending",
    }).populate("recipient", "-email -password");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
 GET FRIENDS
*/
const getFriends = async (req, res) => {
  try {
    // const relationships = await Relationship.find({
    //   status: "accepted",
    //   $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    // })
    //   .populate("requester", "-email -password")
    //   .populate("recipient", "-email -password");
    // const friends = relationships.map((rel) =>
    //   rel.requester._id.toString() === req.user._id.toString()
    //     ? rel.recipient
    //     : rel.requester,
    // );
    // res.status(200).json(friends);

    const relationships = await Relationship.find({
      status: "accepted",
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    });

    // 🧠 Collect all user IDs involved
    const userIds = new Set();

    relationships.forEach((rel) => {
      userIds.add(rel.requester.toString());
      userIds.add(rel.recipient.toString());
    });

    // 🔍 Fetch existing users
    const users = await User.find({
      _id: { $in: Array.from(userIds) },
    }).select("-email -password");

    const validUserMap = new Map();
    users.forEach((user) => {
      validUserMap.set(user._id.toString(), user);
    });

    const validFriends = [];
    const invalidRelationshipIds = [];

    for (const rel of relationships) {
      const requester = validUserMap.get(rel.requester.toString());
      const recipient = validUserMap.get(rel.recipient.toString());

      // ❌ if either user missing → invalid relationship
      if (!requester || !recipient) {
        invalidRelationshipIds.push(rel._id);
        continue;
      }

      const isRequester = rel.requester.toString() === req.user._id.toString();

      validFriends.push(isRequester ? recipient : requester);
    }

    // 🧹 Cleanup invalid relationships
    if (invalidRelationshipIds.length > 0) {
      await Relationship.deleteMany({
        _id: { $in: invalidRelationshipIds },
      });
    }

    res.status(200).json(validFriends);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
 UNFRIEND
*/
const unfriend = async (req, res) => {
  try {
    const friendship = await Relationship.findOne({
      status: "accepted",

      $or: [
        {
          requester: req.user._id,
          recipient: req.params.userId,
        },

        {
          requester: req.params.userId,
          recipient: req.user._id,
        },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        message: "Not friends",
      });
    }

    await friendship.deleteOne();

    // Added Socket For Unfriend status update without refreshing frontend for receiver side
    const receiverSocketId = getReceiverSocketId(req.params.userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userUnfriended");
    }

    res.status(200).json({
      message: "Unfriended successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const blockUser = async (req, res) => {
  try {
    await Block.create({
      blocker: req.user._id,
      blocked: req.params.userId,
    });

    await Relationship.deleteMany({
      $or: [
        {
          requester: req.user._id,
          recipient: req.params.userId,
        },

        {
          requester: req.params.userId,
          recipient: req.user._id,
        },
      ],
    });

    // Added Socket For Block user status update without refreshing frontend for receiver side
    const receiverSocketId = getReceiverSocketId(req.params.userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userBlocked");
    }

    res.status(200).json({
      message: "User blocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const unblockUser = async (req, res) => {
  try {
    await Block.findOneAndDelete({
      blocker: req.user._id,
      blocked: req.params.userId,
    });

    // Added Socket For UnBlock user status update without refreshing frontend for receiver side
    const receiverSocketId = getReceiverSocketId(req.params.userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userUnblocked");
    }

    res.status(200).json({
      message: "User unblocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    // const blockedUsers = await Block.find({
    //   blocker: req.user._id,
    // }).populate("blocked", "-email -password");

    // res.status(200).json(blockedUsers);

    const blockedUsers = await Block.find({
      blocker: req.user._id,
    }).populate("blocked", "-email -password");

    const valid = [];
    const invalidIds = [];

    for (const b of blockedUsers) {
      if (!b.blocked) {
        invalidIds.push(b._id);
        continue;
      }
      valid.push(b.blocked);
    }

    if (invalidIds.length) {
      await Block.deleteMany({ _id: { $in: invalidIds } });
    }

    res.status(200).json(valid);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  AcceptFriendRequest,
  RejectFriendRequest,
  CancelFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  unfriend,
  getBlockedUsers,
  blockUser,
  unblockUser,
};
