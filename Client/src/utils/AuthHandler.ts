import Cookies from "js-cookie";

// This function can be called from Axios interceptor
export const handleAutoLogout = () => {
  Cookies.remove("authToken");
  Cookies.remove("authUser");
  window.location.href = "/login"; // avoid hook, force redirect
};
