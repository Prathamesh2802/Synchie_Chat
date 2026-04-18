import { redis } from "../config/redis.js";

export const messageRateLimit = async (req, res, next) => {
  try {
    if (!req.user._id) return res.status(400).json({ message: "UnAuthorised" });
    const userId = req.user._id;
    const key = `msg:rate:${userId}`;
    const count = await redis.incr(key);
    if (count == 1) {
      await redis.expire(key, 60); // 60 seconds window
    }

    if (count > 20) {
      return res.status(401).json({
        message: "Too many messages. slow down.",
      });
    }
    next();
  } catch (error) {
    console.error("Error in Redis:", error.message);
    next(); // in case redis fails it will still go on next function thats why next is added in catch block as well so that code will continue running without
  }
};

export const RateLimitLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email cannot be empty" });

    const email_key = `loginlimit:email:${email}`;
    const IP_Key = `loginlimit:IP:${req.ip}`;
    const count = await redis.incr(email_key);
    const ipcount = await redis.incr(IP_Key);
    if (count == 1) {
      await redis.expire(email_key, 300); // 300 is in seconds
    }
    if (ipcount == 1) {
      await redis.expire(IP_Key, 300); // 300 is in seconds
    }
    if (count >= 5 || ipcount >= 20) {
      return res.status(400).json({
        message:
          "You have attempted to login 5 times. Please try again after 5 Minutes",
      });
    }
    next();
  } catch (error) {
    console.error("Redis Error: ", error.message);
    next(); // in case redis fails it will still go on next function thats why next is added in catch block as well so that code will continue running without
  }
};
