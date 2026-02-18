import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api", // Replace with your actual API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    Cookies.set("token", token, {
      expires: 7,
      secure: window.location.protocol === "https:",
    });
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
    Cookies.remove("token");
  }
};

// Initialize token from cookie if available
const token = Cookies.get("token");
if (token) {
  setAuthToken(token);
}

export default apiClient;
