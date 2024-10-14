import { check, validationResult } from "express-validator";
import { APIError } from "../utils/APIError.js";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/;

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new APIError(400, "Validation failed", errors.array()));
  }
  next();
};

const passwordValidation = [
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(passwordRegex)
    .withMessage(
      "Password must include at least one special character, one lowercase letter, one uppercase letter, and one numeric value."
    ),
];

export const validateRegisterUser = [
  check("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  check("firstName")
    .isLength({ min: 3, max: 20 })
    .withMessage("First name should be 3-20 characters long.")
    .matches(/^[a-zA-Z]+$/)
    .withMessage("First name should only contain letters."),
  check("lastName")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Last name should not exceed 20 characters.")
    .matches(/^[a-zA-Z]*$/)
    .withMessage("Last name should only contain letters."),
  check("userType")
    .isIn(["admin", "employee"])
    .withMessage("User type must be either 'admin' or 'employee'."),
  check("department")
    .isMongoId()
    .withMessage("Department ID must be a valid MongoDB ID."),
  check("team").isMongoId().withMessage("Team ID must be a valid MongoDB ID."),
  ...passwordValidation,
  validateRequest,
];

export const validateLoginUser = [
  check("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  check("password").notEmpty().withMessage("Password is required."),
  validateRequest,
];

export const validateForgotPassword = [
  check("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  validateRequest,
];

export const validateResetPassword = [
  check("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  check("oldPassword").notEmpty().withMessage("Old password is required."),
  check("newPassword")
    .isLength({ min: 8 })
    .withMessage("New Password must be at least 8 characters long.")
    .matches(passwordRegex)
    .withMessage(
      "New Password must include at least one special character, one lowercase letter, one uppercase letter, and one numeric value."
    ),
  validateRequest,
];

export const validateDepartment = [
  check("name")
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Please provide a department name between 1 and 100 characters."
    )
    .trim(),
  check("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("The description can be up to 500 characters long.")
    .trim(),
  validateRequest,
];

export const validateTeam = [
  check("name")
    .isLength({ min: 1, max: 100 })
    .withMessage("A team name is required and must be 1-100 characters long.")
    .trim(),
  check("department")
    .isMongoId()
    .withMessage("Please provide a valid MongoDB Department ID."),
  check("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("The team description can be up to 500 characters long.")
    .trim(),
  validateRequest,
];

export const validateDiscussion = [
  check("courseId").notEmpty().withMessage("Please specify a valid course ID."),
  check("message")
    .isLength({ min: 1 })
    .withMessage("Discussion message cannot be empty.")
    .trim(),
  validateRequest,
];

export const validateEnrollment = [
  check("courseId").notEmpty().withMessage("Please provide a valid course ID."),
  validateRequest,
];

export const validateFeedback = [
  check("course")
    .notEmpty()
    .withMessage("A valid course ID is required for feedback."),
  check("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5."),
  check("feedbackText")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Feedback text is required and cannot exceed 1000 characters.")
    .trim(),
  validateRequest,
];

export const validateQuiz = [
  check("course").notEmpty().withMessage("Please provide a valid course ID."),
  check("quizScore")
    .isInt({ min: 0, max: 100 })
    .withMessage("Quiz score must be an integer between 0 and 100."),
  validateRequest,
];

export const validateEngagement = [
  check("course")
    .notEmpty()
    .withMessage("A valid course ID is required for engagement."),
  validateRequest,
];

export const validateProgressUpdate = [
  check("courseId").notEmpty().withMessage("Please provide a valid course ID."),
  check("progress")
    .isNumeric()
    .withMessage("Progress must be a valid number.")
    .isInt({ min: 0, max: 100 })
    .withMessage("Progress must be an integer between 0 and 100."),
  validateRequest,
];
