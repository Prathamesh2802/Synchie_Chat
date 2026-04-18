import mongoose from "mongoose";

const relationshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

/*
 Prevent exact duplicates:
 A -> B twice
*/
relationshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Relationship = new mongoose.model(
  "Relationship",
  relationshipSchema,
);
