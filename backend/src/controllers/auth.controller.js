import { User } from "../models/users.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/utils.js";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";

// OLD CODE without OTP Verification
// const signup = async (req, res) => {
//   try {
//     const { email, password, fullName, userName } = req.body;
//     if (!email || !password || !fullName || !userName) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     if (password.length < 6) {
//       return res
//         .status(401)
//         .json({ message: "Password must be greater than 6 characters" });
//     }

//     if (userName.length < 6) {
//       return res
//         .status(401)
//         .json({ message: "Username must be greater than 6 characters" });
//     }

//     const userName_Upper = userName.trim().toUpperCase();

//     const userEmail = await User.findOne({ email });
//     if (userEmail) return res.status(400).json({ message: "Email Exists." });

//     const userNameCheck = await User.findOne({ userName_Upper });
//     if (userNameCheck)
//       return res.status(401).json({ message: "Username already exists" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedpass = await bcrypt.hash(password, salt);
//     const newUser = await new User({
//       email: email,
//       password: hashedpass,
//       fullName: fullName,
//       userName: userName_Upper,
//     });

//     if (newUser) {
//       generateToken(newUser._id, res);
//       await newUser.save();
//       res.status(201).json({
//         message: "User Created Successfully",
//         _id: newUser._id,
//         email: newUser.email,
//         fullName: newUser.fullName,
//         userName: newUser.userName,
//         profile: newUser.profilepic,
//       });
//     } else {
//       res.status(400).json({ message: "Invalid User Data" });
//     }
//   } catch (ex) {
//     console.log(ex);
//     res.status(400).json({ message: "Error occurred" });
//   }
// };

// ? New Imports for Otp generation and Mail Send

import { generateOTP } from "../config/generateOTP.js";
import { sendMailOTP } from "../config/sendOTPEmail.js";
import { OTP } from "../models/otp.model.js";

// ? New Code using OTP Verification - Signup, verify-otp, resend otp

const signup = async (req, res) => {
  try {
    const text = "OTP For registration is: ";
    const { email, password, fullName, userName } = req.body;
    if (!email || !password || !fullName || !userName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(401).json({
        message: "Password must be greater or equal than 8 characters",
      });
    }

    if (userName.length < 6) {
      return res
        .status(401)
        .json({ message: "Username must be greater than 6 characters" });
    }

    const userName_Upper = userName.trim().toUpperCase();

    const userNameCheck = await User.findOne({ userName: userName_Upper });
    if (userNameCheck) {
      if (userNameCheck.isVerified) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }
    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "Email Exists." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpass = await bcrypt.hash(password, salt);

    /*
    UPDATE EXISTING
    UNVERIFIED USER
    */
    if (user && !user.isVerified) {
      user.fullName = fullName;

      user.userName = userName;

      user.password = hashedpass;

      await user.save();

      const otpRecord = await OTP.findOne({
        user: user._id,

        purpose: "register",
      });

      /*
      VALID OTP EXISTS
      */
      if (otpRecord && otpRecord.expiresAt > Date.now()) {
        return res.status(200).json({
          message: "OTP already sent. Please verify.",
        });
      }

      /*
      REMOVE OLD OTP
      */
      if (otpRecord) {
        await otpRecord.deleteOne();
      }
    }

    /*
    CREATE USER
    */
    if (!user) {
      user = await User.create({
        fullName,
        userName,
        email,
        password: hashedpass,

        isVerified: false,
      });
    }

    /*
    GENERATE OTP
    */
    const otp = generateOTP();

    const hashedOtp = await bcrypt.hash(otp, salt);

    /*
    SAVE OTP
    */
    await OTP.create({
      user: user._id,

      otp: hashedOtp,

      purpose: "register",

      expiresAt: Date.now() + 5 * 60 * 1000,

      lastSentAt: Date.now(),
    });

    /*
    SEND EMAIL
    */
    await sendMailOTP(email, otp, text);

    res.status(201).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
=========================
VERIFY OTP for SignUp
=========================
*/
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otpRecord = await OTP.findOne({
      user: user._id,

      purpose: "register",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    //   VERIFY USER

    // user.isVerified = true;

    //   REMOVE TTL FIELD
    // user.verificationExpiresAt = undefined;

    // await user.save();

    await User.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationExpiresAt: 1 },
      },
    );

    /*
      DELETE OTP
      */
    await otpRecord.deleteOne();

    /*
      LOGIN USER
      */
    generateToken(user._id, res);

    res.status(200).json({
      message: "Verified Successfully",
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      profilepic: user.profilpic,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
=========================
RESEND OTP
=========================
*/
const resendOtp = async (req, res) => {
  try {
    const text = "OTP For registration is: ";
    const { email } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let otpRecord = await OTP.findOne({
      user: user._id,

      purpose: "register",
    });

    /*
      COOLDOWN CHECK
      */
    if (otpRecord && Date.now() - otpRecord.lastSentAt < 30000) {
      return res.status(429).json({
        message: "Wait 30 seconds before resend",
      });
    }

    const otp = generateOTP();

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    /*
      UPDATE OTP
      */
    if (otpRecord) {
      otpRecord.otp = hashedOtp;

      otpRecord.expiresAt = Date.now() + 5 * 60 * 1000;

      otpRecord.lastSentAt = Date.now();

      await otpRecord.save();
    } else {
      /*
      CREATE OTP
      */
      await OTP.findOneAndUpdate(
        { user: user._id, purpose: "register" },
        {
          user: user._id,
          purpose: "register",
          otp: hashedOtp,
          expiresAt: Date.now() + 5 * 60 * 1000,
          lastSentAt: Date.now(),
        },
        { upsert: true, new: true },
      );
    }

    await sendMailOTP(email, otp, text);

    res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Reset Password

const forgotPassword = async (req, res) => {
  try {
    const text = "OTP For Reseting Password is: ";
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If email exists, OTP sent",
      });
    }

    // remove old OTP
    await OTP.deleteMany({ user: user._id });

    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await OTP.create({
      user: user._id,
      otp: hashedOtp,
      purpose: "forgot-password",
      expiresAt: Date.now() + 10 * 60 * 1000,
      lastSentAt: Date.now(),
    });

    // generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
      expiresIn: "10m",
    });

    await sendMailOTP(user.email, otp, text);

    res.json({
      message: "OTP sent successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// OTP Verify Reset Password

const resetPassword = async (req, res) => {
  try {
    const { token, otp, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const otpRecord = await OTP.findOne({
      user: user._id,
      purpose: "forgot-password",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    // expiry check
    if (otpRecord.expiresAt < Date.now()) {
      await otpRecord.deleteOne();
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // attempt limit
    otpRecord.attempts += 1;
    if (otpRecord.attempts > 5) {
      await otpRecord.deleteOne();
      return res.status(429).json({
        message: "Too many attempts",
      });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      await otpRecord.save();
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // delete OTP (important)
    await otpRecord.deleteOne();

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid or expired token",
    });
  }
};

// OTP Resend for Reset Password

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(401).json({ message: "All Fields required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Crediantials" });
    const ispassword = await bcrypt.compareSync(password, user.password);
    if (!ispassword)
      return res.status(400).json({ message: "Invalid Crediantials" });

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify OTP first",
      });
    }

    generateToken(user._id, res);

    // resetting redis count so that after successful login it will not block the user
    try {
      await redis.del(`loginlimit:email:${email}`);
    } catch (err) {
      console.log("Redis unavailable, skipping reset");
    }

    res.status(200).json({
      message: "Logged in Successfully",
      email: user.email,
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      profilepic: user.profilepic,
    });
  } catch (ex) {
    res.status(500).json({ message: ex });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "LogOut Successfully" });
  } catch (ex) {
    res.status(500).json({ message: ex });
  }
};

const updateprofilepic = async (req, res) => {
  try {
    const userid = req.user._id;
    const { profilepic } = req.body;
    if (!profilepic)
      return res.status(400).json({ message: "Profile Pic required" });
    const uploadresponse = await cloudinary.uploader.upload(profilepic);
    const updatedUser = await User.findByIdAndUpdate(
      userid,
      {
        profilepic: uploadresponse.secure_url,
      },
      { new: true },
    );
    res.status(200).json(updatedUser);
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ message: ex.message });
  }
};

const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (ex) {
    res.status(400).json({ message: ex });
  }
};

const updateDetails = async (req, res) => {
  try {
    const id = req.user._id;
    const { fullName, password, confirmPassword } = req.body;
    if (!fullName)
      return res.status(400).json({ message: "Full Name should not be empty" });

    if (!password || !confirmPassword)
      return res
        .status(400)
        .json({ message: "Password field should not be empty" });

    if (confirmPassword.length < 8) {
      return res.status(401).json({
        message: "New Password must be greater or equal than 8 characters",
      });
    }

    if (password == confirmPassword)
      return res
        .status(400)
        .json({ message: "Old and New Password cannot be same" });
    const user = await User.findById(id);
    if (!user)
      return res
        .status(400)
        .json({ message: "No Valid User found to update the Profile Details" });

    // Check if the old password written by user is correct or not

    const isOldPassword = await bcrypt.compareSync(password, user.password);
    if (!isOldPassword)
      return res.status(400).json({
        message:
          "Your old password is not correct. Pls enter the correct password.",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(confirmPassword, salt);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        fullName: fullName,
        password: hashedPass,
      },
      { new: true },
    );
    res.status(200).json({
      message: "Updated User Details successfully",
      email: updatedUser.email,
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      userName: updatedUser.userName,
      profilepic: updatedUser.profilepic,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error Occurred while uploading data" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    const users = await User.find({
      userName: {
        $regex: query,
        $options: "i",
      },

      _id: {
        $ne: req.user.id,
      },
    }).select("-email -password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  signup,
  login,
  logout,
  updateprofilepic,
  updateDetails,
  checkAuth,
  searchUsers,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
};
