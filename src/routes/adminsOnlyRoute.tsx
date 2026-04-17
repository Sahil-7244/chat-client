
import { Navigate } from "react-router-dom";
import { getUserFromToken } from "@/lib/utils";
import { JSX } from "react";
import { roles } from "@/config/conditions";

const AdminOnlyRoute = ({ element }: { element: JSX.Element }) => {
  const user = getUserFromToken();

  if (!user || user.role !== roles.ADMIN) {
    return <Navigate to="/not-found" />;
  }

  return element;
};

export default AdminOnlyRoute;