import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosPrivate = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from cookies
axiosPrivate.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle logout
axiosPrivate.interceptors.response.use(
  (response) => {
    // Check if response data contains isLoggedOut flag
    if (response.data && response.data.isLoggedOut === true) {
      // Clear auth token from cookies
      Cookies.remove("authToken");
      Cookies.remove("authUser");
      // Show toast notification
      toast.error(
        response.data.message || "You have been logged out. Please login again."
      );

      // Optional: Redirect to login page
      setTimeout(() => {
        window.location.href = "/login"; // or use your router's navigation
      }, 2000);

      // You can also dispatch a logout action if using Redux/Context
      // dispatch(logout());
    }

    return response;
  },
  (error) => {
    // Handle error responses
    const response = error.response;
    console.log("res", response);
    if (response && response.data && response.data.loggedOut === true) {
      // Clear auth token from cookies
      Cookies.remove("authToken");
      Cookies.remove("authUser");
      // Show toast notification
      toast.error(
        response.data.message || "Session expired. Please login again."
      );

      // Optional: Redirect to login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }

    return Promise.reject(error);
  }
);

export default axiosPrivate;
