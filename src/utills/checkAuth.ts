import { jwtDecode } from "jwt-decode";

export const getUserFromToken = (): any => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode<any>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      // Token expired
      localStorage.removeItem("token");
      return null;
    }
    return decoded;
  } catch (e) {
    localStorage.removeItem("token");
    return null;
  }
};