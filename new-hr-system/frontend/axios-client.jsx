import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
    // baseURL: `http://localhost:8081/`,
  baseURL: `https://hr.miraclecreatives.com/`,
  
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Allow requests from all origins (change this as needed)
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE", // Allow specific HTTP methods
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Authorization", // Allow specific headers
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get("_auth");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      const { response } = error;
      if (response && response.status === 401) {
        // Handle specific cases where you don't want to redirect
        const token = Cookies.get("_auth");

        if (token) {
          // Token exists but is likely expired or invalid
          Cookies.remove("_auth");
          localStorage.setItem(
            "TOKEN_EXPIRE",
            "Your login has expired. Please log in again to continue.",
          );
        }

        // Check if the user is already on the login page
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          // Redirect to the login page if the user is not already there
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error("Error handling response:", error);
    }

    // Always reject the promise to propagate the error
    return Promise.reject(error);
  },
);

export default axiosClient;
