import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import router from "./routes/auth.route.js";
import { connectdb } from "./config/db.js";
import msgRouter from "./routes/message.route.js";
import { app, server } from "./config/socket.js";
import friendrouter from "./routes/relationship.route.js";

// Email Server check import
import { connectEmail } from "./config/sendOTPEmail.js";
//
import { connectRedis } from "./config/redis.js";
import helmet from "helmet";

dotenv.config();

const PORT = process.env.PORT || 5000;

// const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   }),
// );

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// app.use(express.json());
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/message", msgRouter);
app.use("/api/relationships", friendrouter);
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Hello" });
});

// Old Logic
// connectdb().then(() => {
//   app.listen(process.env.PORT, () => {
//     console.log("Started on Port ", process.env.PORT);
//   });

// New Logic with Email Functionality and Redis Functionality
async function startServer() {
  try {
    await connectdb();

    await connectEmail();

    // Adding redis connect function as well

    await connectRedis();

    server.listen(PORT, () => {
      console.log("Started on Port ", PORT);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

startServer();
