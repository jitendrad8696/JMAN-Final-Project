import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../data/userSlice";
import coursesReducer from "../data/coursesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    courses: coursesReducer,
  },
});
