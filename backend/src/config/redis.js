import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
export const redis = new Redis(process.env.REDIS_URL, {
  tls: {}, // Required for upstash
  retryStrategy(times) {
    console.log("🔁 Redis reconnect attempt:", times);

    if (times > 5) {
      console.log("❌ Redis reconnect stopped");
      return null; // 👈 stops reconnecting
    }

    return Math.min(times * 50, 2000);
  },
});

// Events

redis.on("connect", () => {
  console.log("Redis is Connected");
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
});

redis.on("error", (err) => {
  console.error("🔴 Redis error:", err.message);
});

redis.on("close", () => {
  console.log("⚫ Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("🟡 Redis reconnecting...");
});

redis.on("end", () => {
  console.log("🔚 Redis connection ended");
});

export const connectRedis = async () => {
  try {
    const res = await redis.ping();
    console.log("🏓 Redis ping:", res); // PONG
  } catch (err) {
    console.error("❌ Redis ping failed:", err.message);
  }
};
