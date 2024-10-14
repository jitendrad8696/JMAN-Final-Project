import express from "express";
import { Feedback } from "../models/feedback.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { Discussion } from "../models/discussion.model.js";
import {
  validateDiscussion,
  validateFeedback,
} from "../middlewares/validation.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

const getAverageRatings = async (req, res) => {
  try {
    const courses = await Feedback.aggregate([
      {
        $group: {
          _id: "$course",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRatingsMap = courses.reduce((acc, { _id, averageRating }) => {
      acc[_id] = averageRating;
      return acc;
    }, {});

    const courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const response = courseIds.map((course) => ({
      course,
      averageRating: averageRatingsMap[course] || 0,
    }));

    res
      .status(200)
      .json(
        new APIResponse(200, "Average ratings fetched successfully", response)
      );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new APIError(500, "Internal server error", error.message));
  }
};

const submitFeedback = async (req, res) => {
  const { user, course, rating, feedbackText } = req.body;

  try {
    const newFeedback = new Feedback({ user, course, rating, feedbackText });
    await newFeedback.save();
    res
      .status(201)
      .json(new APIResponse(201, "Feedback added successfully", newFeedback));
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json(new APIError(400, "Error adding feedback", error.message));
  }
};

const getDiscussionsByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const discussions = await Discussion.find({ course: courseId })
      .populate("user")
      .sort({ timestamp: -1 });

    res
      .status(200)
      .json(
        new APIResponse(200, "Discussions fetched successfully", discussions)
      );
  } catch (error) {
    console.error("Error fetching discussions:", error);
    res
      .status(500)
      .json(new APIError(500, "Internal server error", error.message));
  }
};

const addDiscussion = async (req, res) => {
  const { courseId } = req.params;
  const { message } = req.body;
  const userId = req._id;

  const newDiscussion = new Discussion({
    user: userId,
    course: courseId,
    message: message,
  });

  try {
    await newDiscussion.save();
    res
      .status(201)
      .json(
        new APIResponse(201, "Discussion added successfully", newDiscussion)
      );
  } catch (error) {
    console.error("Error adding discussion:", error);
    res
      .status(500)
      .json(new APIError(500, "Internal server error", error.message));
  }
};

// Routes
router.get("/average-ratings", verifyToken, getAverageRatings);
router.post("/feedback", verifyToken, validateFeedback, submitFeedback);
router.get("/:courseId/discussions", verifyToken, getDiscussionsByCourse);
router.post(
  "/:courseId/discussions",
  verifyToken,
  validateDiscussion,
  addDiscussion
);

export default router;
