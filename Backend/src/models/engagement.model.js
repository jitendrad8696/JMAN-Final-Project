import mongoose from "mongoose";

const { Schema, model } = mongoose;

const engagementSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Engagement = model("Engagement", engagementSchema);
