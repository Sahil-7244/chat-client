
import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utills/checkAuth";
import { roles } from "../config/conditions";


const AdminOnlyRoute = ({ element }: { element: any }) => {
  const user = getUserFromToken();

  if (!user || user.role !== roles.ADMIN) {
    return <Navigate to="/not-found" />;
  }

  return element;
};

export default AdminOnlyRoute;