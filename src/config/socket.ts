import { io } from "socket.io-client";
import { APIMAINURLFORSOCKET } from "./apiendpoints";
import { getUserFromToken } from "../utills/checkAuth";

const user=getUserFromToken();

const socket = io(APIMAINURLFORSOCKET, {
  auth: {
    userId:user?.id
  },
  transports: ["websocket", "polling"], // include polling if needed
  withCredentials: true, // only if using credentials
}); // Replace with your backend host
export default socket;
