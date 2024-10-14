import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

const AuthenticatedRoute = () => {
  const user = useSelector((state) => state.user.user);

  return user && user.email ? <AuthenticatedLayout /> : <Outlet />;
};

export default AuthenticatedRoute;
