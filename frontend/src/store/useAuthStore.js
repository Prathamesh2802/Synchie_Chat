import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// const BASE_URL = "http://localhost:9000";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isloggingout: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,

  // Socket IO Methods
  onlineUsers: [],
  socket: null,
  connectSocket: () => {
    try {
      const { authUser } = get();
      if (!authUser || get().socket?.connected) return;
      const socket = io(BASE_URL, {
        query: {
          userId: authUser._id,
        },
      });
      socket.connect();
      set({ socket: socket });
      console.log("Socket Connected");
      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },
  disconnectSocket: () => {
    try {
      if (get().socket?.connected) get().socket.disconnect();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },
  //

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/checkAuth");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("error in check auth:", error.message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // New Signup,Verify OTP and Resend OTP logic for the Registration

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success(res.data.message);

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);

      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOtp: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);

      set({ authUser: res.data });

      toast.success(res.data.message);

      get().connectSocket();

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);

      return false;
    }
  },

  resendOtp: async (email) => {
    try {
      const res = await axiosInstance.post("/auth/resend-otp", { email });

      toast.success(res.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },

  // Forgot Password, OTP and Token creation
  sendResetOTP: async (email) => {
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });

      const token = res.data.token;

      // store safely
      sessionStorage.setItem("resetToken", token);

      toast.success(res.data.message);

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    }
  },
  // Reset password and otp verify
  resetPassword: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/reset-password", data);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    }
  },

  // Commented the Old SignUp Logic because of OTP Implementation
  // signup: async (data) => {
  //   set({ isSigningUp: true });
  //   try {
  //     const res = await axiosInstance.post("/auth/signup", data);
  //     set({ authUser: res.data });
  //     toast.success("Account created successfully");
  //     get().connectSocket();
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error?.response?.data?.message);
  //   } finally {
  //     set({ isSigningUp: false });
  //   }
  // },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      // Socket IO Features can be ignored if we dont want online or offline feature
      get().connectSocket();
      //
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isloggingout: true });
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isloggingout: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/updateprofilepic", data);
      set({ authUser: res.data });
      toast.success("Image Uploaded successfully");
    } catch (error) {
      console.log("Error in profile upload: ", error.message);
      toast.error(error?.response?.data?.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  UpdateDetails: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/updatedetails", data);
      set({ authUser: res.data });
      toast.success("User Details updated successfully.");
      return true;
    } catch (error) {
      console.log("Error in profile upload: ", error.message);
      toast.error(error?.response?.data?.message);
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
