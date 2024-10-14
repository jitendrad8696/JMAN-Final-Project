import express from "express";
import { Department } from "../models/department.model.js";
import { Team } from "../models/team.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  validateDepartment,
  validateTeam,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

const fetchDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();
    res
      .status(200)
      .json(
        new APIResponse(200, "Departments fetched successfully", departments)
      );
  } catch (error) {
    console.error("Error fetching departments:", error);
    next(new APIError(500, "Failed to fetch departments."));
  }
};

const fetchTeamsByDepartment = async (req, res, next) => {
  const { departmentId } = req.params;

  try {
    const teams = await Team.find({ department: departmentId });

    if (!teams.length) {
      return next(new APIError(404, "No teams found for this department."));
    }

    res
      .status(200)
      .json(new APIResponse(200, "Teams fetched successfully", teams));
  } catch (error) {
    console.error("Error fetching teams:", error);
    next(new APIError(500, "Failed to fetch teams."));
  }
};

const createDepartment = async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const newDepartment = new Department({ name, description });
    await newDepartment.save();
    res
      .status(201)
      .json(
        new APIResponse(201, "Department created successfully", newDepartment)
      );
  } catch (error) {
    if (error.code === 11000) {
      return next(new APIError(409, "Department name already exists."));
    }
    console.error("Error creating department:", error);
    next(new APIError(500, "Failed to create department."));
  }
};

const createTeam = async (req, res, next) => {
  const { name, department, description } = req.body;

  try {
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return next(new APIError(404, "Department not found."));
    }

    const newTeam = new Team({ name, department, description });
    await newTeam.save();

    res
      .status(201)
      .json(new APIResponse(201, "Team created successfully", newTeam));
  } catch (error) {
    if (error.code === 11000) {
      return next(new APIError(409, "Team name already exists."));
    }
    console.error("Error creating team:", error);
    next(new APIError(500, "Failed to create team."));
  }
};

router.get("/", verifyToken, fetchDepartments);
router.get("/get-teams/:departmentId", verifyToken, fetchTeamsByDepartment);

router.post("/create-team", verifyToken, validateTeam, createTeam);

router.post(
  "/create-department",
  verifyToken,
  validateDepartment,
  createDepartment
);

export default router;
