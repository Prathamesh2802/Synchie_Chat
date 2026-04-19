import mongoose from "mongoose";

// ? Old Schema without User deletion or otp verification
// const userschema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },
//     fullName: {
//       type: String,
//       required: true,
//     },
//     userName: {
//       type: String,
//       required: true,
//       unique: true,
//       minlength: 6,
//     },
//     profilepic: {
//       type: String,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// ? New Logic with User deletion (NON verified) and otp generation

const userschema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilepic: {
      type: String,
      default: "",
    },
    verificationExpiresAt: {
      type: Date,
      // default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), No need for Default
    },
  },
  { timestamps: true },
);

userschema.index(
  {
    verificationExpiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export const User = new mongoose.model("User", userschema);
