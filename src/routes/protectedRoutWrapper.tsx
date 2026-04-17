import { Navigate, Outlet } from "react-router-dom";
import { pagepaths } from "../constant/pagepaths";

export default function ProtectedRoute({ isauthenticated }: { isauthenticated: boolean }) {
  if (!isauthenticated) {
    return <Navigate to={pagepaths.LOGINPAGE} replace />;
  }
  return <Outlet />;
}