import axios from "axios";

export const axiosInstance = axios.create({
  // baseURL: "http://localhost:9000/api",
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,

  withCredentials: true, // with crediantials parameter used for auth cookies
});
