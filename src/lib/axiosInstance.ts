
import axios from "axios";
import { toast } from "sonner";
import { APIMAINURL } from "../config/apiendpoints";

const axiosInstance = axios.create({
  baseURL: APIMAINURL,
});

// === 🔌 Internet Status Detection ===
let offlineToastShown = false;

function handleOffline() {
  if (!offlineToastShown) {
    toast.error("📴 No internet connection detected.");
    offlineToastShown = true;
  }
}

function handleOnline() {
  if (offlineToastShown) {
    toast.success("✅ Internet connection restored!");
    offlineToastShown = false;
  }
}

// Attach listeners once (browser events)
if (typeof window !== "undefined") {
  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);
}

// === 🔑 Request Interceptor ===
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check internet before sending request
    if (!navigator.onLine) {
      handleOffline();
      return Promise.reject(new Error("No internet connection"));
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// === ⚙️ Response Interceptor ===
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response at all)
    if (!error.response) {
      if (navigator.onLine) {
        toast.error("🚨 Server unreachable.");
      } else {
        handleOffline();
      }
    }
    // Unauthorized / Token issues
    else if (
      (error.response.status === 401 &&
        (error.response.data.message === "Invalid or expired token" ||
          error.response.data.message === "Token is wrong or expired"))
    ) {
      console.error("🔒 Unauthorized. Token may have expired.", error);
      localStorage.removeItem("token");
      toast.error("🔒 Session expired. Please login again.");
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
