import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";
import { Block } from "../models/block.models.js";
import Message from "../models/message.models.js";
import { User } from "../models/users.js";

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedinUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedinUser },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (ex) {
    res.status(400).json({ message: ex });
  }
};

const getMessage = async (req, res) => {
  try {
    const { id: usertochatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: usertochatId },
        { senderId: usertochatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (ex) {
    res.status(400).json({ message: ex });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user._id;
    const { id: receiverId } = req.params;

    // Check of the user is blocked if yes you cannot send message

    const block = await Block.findOne({
      $or: [
        { blocker: senderId, blocked: receiverId },
        { blocker: receiverId, blocked: senderId },
      ],
    });

    if (block) {
      return res.status(400).json({
        message:
          "Cannot send message at this moment. User is no longer responding to this converstation",
      });
    }
    let imageurl;
    if (image) {
      //upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageurl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageurl,
    });

    await newMessage.save();
    // Realtime functionality goes here => socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // Emit to one person that is to receiver
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (ex) {
    res.status(400).json(ex);
    console.log(ex);
  }
};

const clearAllMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Sender Id and Receiver Id cannot be blank" });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        message: "Cannot clear chat with yourself",
      });
    }

    await Message.deleteMany({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    res.status(200).json({ message: "Messages cleared successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error while Deleting Messages" });
  }
};

export { getUsersForSidebar, getMessage, sendMessage, clearAllMessage };
