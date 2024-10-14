import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import useLogout from "../hooks/useLogout";

import JmanLogo from "../assets/jman.jpg";
import JmanTag from "../assets/jman.svg";

function Sidebar() {
  const userInfo = useSelector((state) => state.user.user);
  const logoutUser = useLogout();

  return (
    <div className="w-80 bg-gray-800 text-white h-full p-3 py-7 space-y-4">
      <div className="flex items-center mb-6 space-x-4">
        <Link to="/">
          <img
            src={JmanLogo}
            alt="Logo"
            className="h-16 rounded-full cursor-pointer"
          />
        </Link>
        <Link to="/">
          <img src={JmanTag} alt="Tag" className="h-16 cursor-pointer" />
        </Link>
      </div>

      <div className="bg-gray-900 rounded-lg p-2 shadow-lg">
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-300 mb-1">
            Name: {userInfo.firstName} {userInfo.lastName}
          </p>
          <p className="text-gray-300 mb-1">Email: {userInfo.email}</p>
          <p className="text-gray-300">User Type: {userInfo.userType}</p>
          <p className="text-gray-300">
            Department: {userInfo.department.name}
          </p>
          <p className="text-gray-300">Team: {userInfo.team.name}</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-lg p-2 space-y-4">
        <Link
          to="/home"
          className="block text-center text-gray-300 hover:text-white py-2 px-4 rounded bg-gray-700 hover:bg-gray-600"
        >
          Home
        </Link>

        {userInfo.userType === "admin" ? (
          <Link
            to="/register-user"
            className="block text-center text-gray-300 hover:text-white py-2 px-4 rounded bg-gray-700 hover:bg-gray-600"
          >
            Register User
          </Link>
        ) : (
          <div></div>
        )}

        <Link
          to="/reset-password"
          className="block text-center text-gray-300 hover:text-white py-2 px-4 rounded bg-gray-700 hover:bg-gray-600"
        >
          Reset Password
        </Link>
        <Link
          to="/forgot-password"
          className="block text-center text-gray-300 hover:text-white py-2 px-4 rounded bg-gray-700 hover:bg-gray-600"
        >
          Forgot Password
        </Link>
        <button
          onClick={logoutUser}
          className="w-full mt-2 p-2 bg-red-600 rounded text-white hover:bg-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
