import jwt from "jsonwebtoken";

export const generateToken = (userid, res) => {
  const token = jwt.sign({ userid }, process.env.JWT_TOKEN, {
    expiresIn: "7d",
  });

  //   res.cookie("jwt", token, {
  //   maxAge: 7 * 24 * 69 * 60 * 1000,
  //   httpOnly: true,
  //   sameSite: "strict",
  //   secure: process.env.NODE_ENV !== "development",
  // });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 69 * 60 * 1000,
    httpOnly: true,
    sameSite: isProd ? "None" : "strict",
    secure: isProd,
  });
};
