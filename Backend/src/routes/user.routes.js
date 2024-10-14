import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUser,
  getEnrollments,
  enrollInCourse,
  updateEnrollmentProgress,
  submitFeedback,
  submitQuizScore,
  saveEngagement,
} from "../controllers/user.controllers.js";

import {
  validateRegisterUser,
  validateLoginUser,
  validateForgotPassword,
  validateResetPassword,
  validateEnrollment,
  validateProgressUpdate,
  validateFeedback,
  validateQuiz,
  validateEngagement,
} from "../middlewares/validation.middleware.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { Enrollment } from "../models/enrollment.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.model.js";
import { Engagement } from "../models/engagement.model.js";
import { Department } from "../models/department.model.js";

const router = express.Router();

// User Routes
router.post("/register", validateRegisterUser, registerUser);
router.post("/login", validateLoginUser, loginUser);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.put("/reset-password", validateResetPassword, resetPassword);

// Authenticated User Route
router.get("/user", verifyToken, getUser);
router.post("/logout", verifyToken, logoutUser);

router.get("/courses", verifyToken, getEnrollments);
router.post("/enroll", verifyToken, validateEnrollment, enrollInCourse);
router.patch(
  "/enrollments/progress",
  verifyToken,
  validateProgressUpdate,
  updateEnrollmentProgress
);

router.post("/feedback", verifyToken, validateFeedback, submitFeedback);
router.post("/quiz/score", verifyToken, validateQuiz, submitQuizScore);
router.post("/engagement", verifyToken, validateEngagement, saveEngagement);

router.get("/dashboard-data", async (req, res) => {
  try {
    // 1. Total Employees
    const totalEmployees = await User.countDocuments({ userType: "employee" });

    // 2. Active Courses
    const activeCourses = await Enrollment.distinct("course").countDocuments();

    // 3. Completed Employees (distinct users)
    const completedEmployeesCount = await Enrollment.distinct("user", {
      progress: 100,
    }).then((users) => users.length);

    // 4. Avg Engagement Time
    const avgEngagement = await Engagement.aggregate([
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$timeSpent" },
        },
      },
    ]);

    // 5. All Departments with Teams Inside
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: "teams", // collection of the teams
          localField: "_id",
          foreignField: "department",
          as: "teams",
        },
      },
    ]);

    // 6. Monday to Sunday User Engagement Count
    const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayEngagement = await Engagement.aggregate([
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$dayOfWeek",
          count: { $sum: 1 },
        },
      },
    ]);

    // Fill in zeros for missing days
    const dayCounts = allDays.map((day, index) => {
      const found = dayEngagement.find(
        (engagement) => engagement._id === index + 1
      );
      return { day, count: found ? found.count : 0 };
    });

    // Create formatted string for days
    const dayCountString = dayCounts
      .map((dc) => `${dc.day}: ${dc.count}`)
      .join(", ");

    // 7. Jan to Dec Monthly Course Completion
    const monthlyCompletion = await Enrollment.aggregate([
      {
        $match: { progress: 100 }, // Only completed courses
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);

    // Fill in zeros for missing months
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyCounts = months.map((month, index) => {
      const found = monthlyCompletion.find(
        (completion) => completion._id === index + 1
      );
      return { month, count: found ? found.count : 0 };
    });

    // Create formatted string for months
    const monthCountString = monthlyCounts
      .map((mc) => `${mc.month}: ${mc.count}`)
      .join(", ");

    // 8. Employee List with Course Ratings
    const employeeCourses = await User.aggregate([
      {
        $match: { userType: "employee" },
      },
      {
        $lookup: {
          from: "enrollments",
          localField: "_id",
          foreignField: "user",
          as: "enrollments",
        },
      },
      {
        $unwind: { path: "$enrollments", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "teams",
          localField: "team",
          foreignField: "_id",
          as: "team",
        },
      },
      {
        $unwind: { path: "$team", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "feedbacks", // Use feedback model to get ratings
          let: { user: "$_id", course: "$enrollments.course" }, // Define variables
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$user"] }, // Match user ID
                    { $eq: ["$course", "$$course"] }, // Match course ID
                  ],
                },
              },
            },
          ],
          as: "feedbackDetails",
        },
      },
      {
        $addFields: {
          feedbackDetails: { $ifNull: ["$feedbackDetails", []] }, // Ensure feedbackDetails is an array
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          department: "$department", // Return whole department object
          team: "$team", // Return whole team object
          course: "$enrollments.course",
          rating: {
            $cond: {
              if: { $gt: [{ $size: "$feedbackDetails" }, 0] }, // Check if feedbackDetails array has elements
              then: { $arrayElemAt: ["$feedbackDetails.rating", 0] }, // Get rating from feedback model
              else: "N/A", // Return "N/A" if no rating
            },
          },
        },
      },
    ]);

    // 9. Average Time Spent on Each Course
    const avgTimePerCourse = await Engagement.aggregate([
      {
        $group: {
          _id: "$course",
          avgTime: { $avg: "$timeSpent" },
        },
      },
    ]);

    // Format avgTimePerCourse to ensure all 12 courses are returned
    const formattedAvgTime = Array.from({ length: 12 }, (_, index) => {
      const courseId = index + 1; // Course IDs from 1 to 12
      const avgData = avgTimePerCourse.find((data) => data._id === courseId);
      return {
        id: courseId,
        avgTime: avgData ? avgData.avgTime : 0,
      };
    });

    // Final response with all data
    res.status(200).json(
      new APIResponse(200, "Dashboard data fetched successfully", {
        totalEmployees,
        activeCourses,
        completedEmployeesCount,
        avgEngagement: avgEngagement[0]?.avgTime || 0,
        departments,
        dayEngagement: dayCountString,
        monthlyCompletion: monthCountString,
        avgTimePerCourse: formattedAvgTime,
        employeeCourses,
      })
    );
  } catch (err) {
    next(new APIError(500, "Error fetching dashboard data", err.message));
  }
});

export default router;
