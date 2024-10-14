import sendgridMail from "@sendgrid/mail";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { CORS_ORIGIN, SENDGRID_FROM_EMAIL } from "../config/index.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Feedback } from "../models/feedback.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Engagement } from "../models/engagement.model.js";

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 86400000,
};

const clearCookiesOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

const generateRandomPassword = (length = 8) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  return Array.from(
    { length },
    () => charset[Math.floor(Math.random() * charset.length)]
  ).join("");
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, userType, department, team, password } =
      req.body;

    if (await User.findOne({ email })) {
      return next(new APIError(400, "Email is already in use."));
    }

    const user = await User.create({
      email,
      firstName,
      lastName,
      userType,
      department,
      team,
      password,
    });

    if (!user) {
      return next(new APIError(500, "User registration failed."));
    }

    await sendgridMail.send({
      to: user.email,
      from: SENDGRID_FROM_EMAIL,
      subject: "Account Created Successfully",
      text: `Your account has been created successfully! Welcome aboard!\n\nHere are your credentials:\nEmail: ${user.email}\nPassword: ${password}\n\nYou can log in at: ${CORS_ORIGIN}`,
    });
    res
      .status(201)
      .json(
        new APIResponse(
          201,
          "User created successfully! Credentials have been sent to the user's email."
        )
      );
  } catch (error) {
    console.error("Error: User registration failed:", error);
    next(new APIError(500, error.message));
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .populate("department", "name")
      .populate("team", "name");

    if (!user) {
      return next(new APIError(404, "User does not exist."));
    }

    if (!(await user.isPasswordValid(password))) {
      return next(new APIError(400, "Invalid password."));
    }

    const token = user.genAccessToken();
    const userObj = user.toObject();
    delete userObj.password;

    res.cookie("token", token, cookiesOptions);
    res.status(200).json(
      new APIResponse(200, "User logged in successfully", {
        user: userObj,
      })
    );
  } catch (error) {
    console.error("Error: User login failed:", error);
    next(new APIError(500, error.message));
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError(404, "User with this email does not exist."));
    }

    const randomPassword = generateRandomPassword();
    user.password = randomPassword;
    await user.save();

    await sendgridMail.send({
      to: user.email,
      from: SENDGRID_FROM_EMAIL,
      subject: "Password Reset",
      text: `Your new password is: ${randomPassword}\nPlease change your password after logging in.`,
    });

    res.clearCookie("token", clearCookiesOptions);
    res
      .status(200)
      .json(new APIResponse(200, "Password reset email sent successfully."));
  } catch (error) {
    console.error("Error sending password reset email:", error);
    next(new APIError(500, error.message));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError(404, "User not found."));
    }

    if (!(await user.isPasswordValid(oldPassword))) {
      return next(new APIError(401, "Invalid old password."));
    }

    user.password = newPassword;
    await user.save();

    res.clearCookie("token", clearCookiesOptions);
    res
      .status(200)
      .json(
        new APIResponse(
          200,
          "Password reset successfully. Please log in again."
        )
      );
  } catch (error) {
    console.error("Error resetting password:", error);
    next(new APIError(500, error.message));
  }
};

export const logoutUser = (req, res, next) => {
  try {
    res.clearCookie("token", clearCookiesOptions);
    res.status(200).json(new APIResponse(200, "User logged out successfully."));
  } catch (error) {
    console.error("Error logging out user:", error);
    next(new APIError(500, error.message));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { _id } = req;

    if (!_id) {
      return next(new APIError(401, "Unauthorized access."));
    }

    const user = await User.findById(_id)
      .select("-password")
      .populate("department", "name")
      .populate("team", "name");

    if (!user) {
      return next(new APIError(404, "User not found."));
    }

    res
      .status(200)
      .json(new APIResponse(200, "User fetched successfully.", user));
  } catch (error) {
    console.error("Error fetching user data:", error);
    next(new APIError(500, error.message));
  }
};

export const getEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req._id });
    res
      .status(200)
      .json(
        new APIResponse(200, "Enrollments retrieved successfully", enrollments)
      );
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    next(new APIError(500, error.message));
  }
};

export const enrollInCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    const existingEnrollment = await Enrollment.findOne({
      user: req._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json(new APIError(400, "User is already enrolled in this course."));
    }

    const enrollment = new Enrollment({ user: req._id, course: courseId });
    const savedEnrollment = await enrollment.save();

    res
      .status(201)
      .json(
        new APIResponse(201, "Enrollment created successfully", savedEnrollment)
      );
  } catch (error) {
    res.status(500).json(new APIError(500, error.message));
  }
};

export const updateEnrollmentProgress = async (req, res) => {
  const { courseId, progress } = req.body;

  try {
    const updatedEnrollment = await Enrollment.findOneAndUpdate(
      { user: req._id, course: courseId },
      { progress },
      { new: true }
    );

    if (!updatedEnrollment) {
      return res.status(404).json(new APIError(404, "Enrollment not found."));
    }

    res
      .status(200)
      .json(
        new APIResponse(200, "Progress updated successfully", updatedEnrollment)
      );
  } catch (error) {
    res.status(500).json(new APIError(500, error.message));
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const { course, rating, feedbackText } = req.body;

    const feedback = new Feedback({
      user: req._id,
      course,
      rating,
      feedbackText,
    });

    const savedFeedback = await feedback.save();

    res
      .status(201)
      .json(
        new APIResponse(201, "Feedback submitted successfully.", savedFeedback)
      );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    next(new APIError(500, error.message));
  }
};

export const submitQuizScore = async (req, res, next) => {
  try {
    const { course, quizScore } = req.body;

    const quiz = new Quiz({
      user: req._id,
      course,
      quizScore,
    });

    const savedQuiz = await quiz.save();

    res
      .status(201)
      .json(
        new APIResponse(201, "Quiz score submitted successfully.", savedQuiz)
      );
  } catch (error) {
    console.error("Error submitting quiz score:", error);
    next(new APIError(500, error.message));
  }
};

export const saveEngagement = async (req, res, next) => {
  try {
    const { course } = req.body;

    await Engagement.findOneAndUpdate(
      { user: req._id, course },
      { $inc: { timeSpent: 1 } },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json(new APIResponse(200, "Engagement data updated successfully."));
  } catch (error) {
    console.error("Error updating engagement data:", error);
    next(new APIError(500, error.message));
  }
};
