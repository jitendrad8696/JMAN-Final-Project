import mongoose from "mongoose";

const { Schema, model } = mongoose;

const quizSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: Number,
    required: true,
  },
  quizScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Quiz = model("Quiz", quizSchema);
