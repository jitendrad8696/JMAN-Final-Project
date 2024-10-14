import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import axios from "../config/axiosConfig";
import { logout } from "../data/userSlice";
import { USERS_API_URI } from "../config";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);

  const validate = ({ email, oldPassword, newPassword }) => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

    if (!email || !emailPattern.test(email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!oldPassword) {
      newErrors.oldPassword = "Old password is required.";
    }

    if (!newPassword || !passwordPattern.test(newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters long and include a special character, uppercase, lowercase, and a number.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const trimmedFormData = {
      email: formData.email.trim(),
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    };
    setFormData(trimmedFormData);

    const validationErrors = validate(trimmedFormData);
    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
      try {
        const { data } = await axios.put(
          `${USERS_API_URI}/reset-password`,
          trimmedFormData
        );

        if (data.success) {
          alert("Password reset successfully. Redirecting to login page...");
          setTimeout(() => {
            dispatch(logout());
            navigate("/login");
          }, 300);
        } else {
          setErrors({ api: data.message });
        }
      } catch (error) {
        setErrors({
          api:
            error.response?.data?.message ||
            "An error occurred. Please try again.",
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
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Jitendra@gmail.com"
              required
              className={`w-full p-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="********"
              required
              className={`w-full p-2 border ${
                errors.oldPassword ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
            {errors.oldPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Abc@1234"
              required
              className={`w-full p-2 border ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full p-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
            disabled={loading}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
          {errors.api && (
            <p className="text-red-500 text-sm mt-1">{errors.api}</p>
          )}
        </form>
        {user && user.email ? null : (
          <p className="mt-2 text-center">
            Remember your password?{" "}
            <Link to="/login" className="text-blue-500 link">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
