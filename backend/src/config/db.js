import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_DB);
    console.log("Connection to DB Established");
  } catch (ex) {
    console.log(ex);
    process.exit(1);
  }
};
