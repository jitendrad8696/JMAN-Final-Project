import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import axios from "../config/axiosConfig";
import { logout } from "../data/userSlice";
import { USERS_API_URI } from "../config";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);

  const validate = ({ email }) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};

    if (!email || !emailPattern.test(email)) {
      newErrors.email = "Enter a valid email.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const trimmedFormData = { email: formData.email.trim() };
    const validationErrors = validate(trimmedFormData);

    if (Object.keys(validationErrors).length === 0) {
      setErrors({});

      try {
        const response = await axios.post(
          `${USERS_API_URI}/forgot-password`,
          trimmedFormData
        );

        if (response.data.success) {
          alert(
            "A temporary password has been sent to your email. Use it to log in and reset your password."
          );

          setTimeout(() => {
            dispatch(logout());
            navigate("/login");
          }, 300);
        } else {
          setErrors({ api: response.data.message });
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
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
          <button
            type="submit"
            className={`w-full p-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          {errors.api && (
            <p className="text-red-500 text-sm mt-1">{errors.api}</p>
          )}
        </form>
        {user && user.email ? null : (
          <p className="mt-4 text-center">
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

export default ForgotPassword;
