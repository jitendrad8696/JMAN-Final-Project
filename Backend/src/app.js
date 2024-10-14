import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";

import { CORS_ORIGIN } from "./config/index.js";
import { APIError } from "./utils/APIError.js";
import { APIResponse } from "./utils/APIResponse.js";

dotenv.config();

const app = express();

// Logging middleware
app.use(morgan("combined"));
// Add security headers
app.use(helmet());

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json(new APIResponse(200, "Server is running!"));
});

// Import routes
import userRoutes from "./routes/user.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import departmentRoutes from "./routes/department.routes.js";

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/departments", departmentRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  next(new APIError(404, "Route not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      details: err.details || null,
    });
  } else {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
      details: err,
    });
  }
});

export { app };
