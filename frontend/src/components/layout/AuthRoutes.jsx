import React from "react";
import { Outlet } from "react-router-dom";

// AuthProvider is now in main.jsx (wraps entire app)
export default function AuthRoutes() {
  return <Outlet />;
}
