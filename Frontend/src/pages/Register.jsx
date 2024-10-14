import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../config/axiosConfig";
import { USERS_API_URI, DEPARTMENTS_API_URI } from "../config/";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "employee",
    department: "",
    team: "",
    password: "",
  });

  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(DEPARTMENTS_API_URI);
        if (response.data.success) {
          setDepartments(response.data.data);
        } else {
          setErrors((prev) => ({ ...prev, api: response.data.message }));
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          api: error.response?.data?.message || "Error fetching departments",
        }));
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      if (formData.department) {
        try {
          const response = await axios.get(
            `${DEPARTMENTS_API_URI}/get-teams/${formData.department}`
          );
          if (response.data.success) {
            setTeams(response.data.data);
          } else {
            setErrors((prev) => ({ ...prev, api: response.data.message }));
          }
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            api: error.response?.data?.message || "Error fetching teams",
          }));
        }
      } else {
        setTeams([]);
      }
    };
    fetchTeams();
  }, [formData.department]);

  const validate = (data) => {
    const newErrors = {};
    if (
      !data.firstName ||
      data.firstName.length < 3 ||
      data.firstName.length > 20
    ) {
      newErrors.firstName = "First name must be between 3 and 20 characters.";
    }
    if (data.lastName.length > 20) {
      newErrors.lastName = "Last name must not exceed 20 characters.";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailPattern.test(data.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!data.department) {
      newErrors.department = "Please select a department.";
    }
    if (!data.team && data.department) {
      newErrors.team = "Please select a team.";
    }
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!data.password || !passwordPattern.test(data.password)) {
      newErrors.password =
        "Password must be at least 8 characters long and include a special character, a lowercase letter, an uppercase letter, and a number.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const trimmedData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
    };

    setFormData(trimmedData);

    const validationErrors = validate(trimmedData);

    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
      try {
        const response = await axios.post(
          `${USERS_API_URI}/register`,
          trimmedData
        );
        if (response.data.success) {
          alert(
            "User created successfully! Credentials have been sent to the user's email."
          );
          setTimeout(() => {
            navigate("/home");
          }, 300);
        } else {
          setErrors({ api: response.data.message });
        }
      } catch (error) {
        setErrors({
          api:
            error.response?.data?.message ||
            "Registration failed. Please try again later.",
        });
      }
    } else {
      setErrors(validationErrors);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          {["firstName", "lastName", "email", "password"].map(
            (field, index) => (
              <div className="mb-2" key={index}>
                <label className="block text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={
                    field === "email"
                      ? "email"
                      : field === "password"
                      ? "password"
                      : "text"
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${
                    field.charAt(0).toUpperCase() + field.slice(1)
                  }`}
                  className={`w-full p-2 border ${
                    errors[field] ? "border-red-500" : "border-gray-300"
                  } rounded`}
                />
                {errors[field] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                )}
              </div>
            )
          )}
          <div className="mb-2">
            <label className="block text-gray-700">User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Team</label>
            <select
              name="team"
              value={formData.team}
              onChange={handleChange}
              disabled={!formData.department}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
            {errors.team && (
              <p className="text-red-500 text-sm mt-1">{errors.team}</p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full p-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          {errors.api && (
            <p className="text-red-500 text-sm mt-1">{errors.api}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
