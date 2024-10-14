import { useDispatch } from "react-redux";

import axios from "../config/axiosConfig";

import { logout } from "../data/userSlice";
import { USERS_API_URI } from "../config";

const useLogout = () => {
  const dispatch = useDispatch();

  const logoutUser = async () => {
    try {
      await axios.post(`${USERS_API_URI}/logout`);
    } catch (error) {
      console.error("Error logging out:", error);
      alert("An error occurred while logging out. Please try again.");
      if (error.response) {
        console.error("Error response:", error.response.data?.message);
      }
    } finally {
      dispatch(logout());
    }
  };

  return logoutUser;
};

export default useLogout;
