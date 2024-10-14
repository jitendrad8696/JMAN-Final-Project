import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import axios from "../config/axiosConfig";
import { USERS_API_URI } from "../config";
import { saveUser } from "../data/userSlice";

import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

import Register from "../pages/Register";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import AdminHome from "../pages/AdminHome";
import EmployeeHome from "../pages/EmployeeHome";
import CourseDeatils from "../pages/CourseDeatils";

const AppRouter = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${USERS_API_URI}/user`);

        if (response.data.success) {
          dispatch(saveUser(response.data.data));
          setIsAuthenticated(true);
        } else {
          console.error("Error fetching user data:", response.data.message);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "Error fetching user data:",
          error.response?.data?.message
        );
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    if (!user || !user.email) {
      fetchUser();
    } else {
      setLoading(false);
      setIsAuthenticated(true);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {user.userType === "admin" && (
                <>
                  <Route path="/home" element={<AdminHome />} />
                  <Route path="/register-user" element={<Register />} />
                </>
              )}

              {user.userType === "employee" && (
                <>
                  <Route path="/home" element={<EmployeeHome />} />
                  <Route
                    path="/course-details/:id"
                    element={<CourseDeatils />}
                  />
                </>
              )}
            </Route>

            <Route path="*" element={<Navigate to="/home" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default AppRouter;
