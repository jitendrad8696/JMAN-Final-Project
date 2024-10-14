import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import axios from "../config/axiosConfig";
import { saveUser } from "../data/userSlice";
import { USERS_API_URI } from "../config";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = (data) => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email || !emailPattern.test(data.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!data.password) {
      newErrors.password = "Password is required.";
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
      password: formData.password,
    };

    const validationErrors = validate(trimmedFormData);

    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
      try {
        const { data } = await axios.post(
          `${USERS_API_URI}/login`,
          trimmedFormData
        );

        if (data.success) {
          dispatch(saveUser(data.data));
          navigate("/home");
        } else {
          setErrors({ api: data.message });
        }
      } catch (error) {
        setErrors({
          api:
            error.response?.data?.message || "Login failed. Please try again.",
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
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
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
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
              className={`w-full p-2 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div className="mb-4 flex justify-between">
            <Link to="/forgot-password" className="text-blue-500 text-sm link">
              Forgot password?
            </Link>
            <Link to="/reset-password" className="text-blue-500 text-sm link">
              Reset Password
            </Link>
          </div>
          <button
            type="submit"
            className={`w-full p-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {errors.api && (
            <p className="text-red-500 text-sm mt-2">{errors.api}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
