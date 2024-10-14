import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";

const AuthenticatedLayout = () => (
  <div className="flex h-screen">
    <Sidebar />
    <main className="flex-1 overflow-auto">
      <Outlet />
    </main>
  </div>
);

export default AuthenticatedLayout;
