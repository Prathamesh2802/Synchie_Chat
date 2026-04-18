import { Routes, Route, Navigate } from "react-router";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ProfilePages from "./Pages/ProfilePages";
import Navbar from "./Components/Navbar";
import SettingPage from "./Pages/SettingPage";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { useThemeStore } from "./store/useThemeStore";
import RelationshipPage from "./Pages/RelationshipPage";
import VerifyOtp from "./Pages/VerifyOtp";
import UpdateProfile from "./Pages/UpdateProfile";

import ForgotPassword from "./Pages/ForgotPassword";
import VerifyReset from "./Pages/VerifyReset";
import PageNotFound from "./Pages/PageNotFound";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!authUser ? <Signup /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePages /> : <Navigate to="/login" />}
        />

        <Route
          path="/friends"
          element={authUser ? <RelationshipPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/updateprofile"
          element={authUser ? <UpdateProfile /> : <Navigate to="/login" />}
        />

        <Route
          path="/verify-otp"
          element={!authUser ? <VerifyOtp /> : <Navigate to="/" />}
        />

        {/* Forgot password flow */}
        <Route
          path="/forgot-password"
          element={!authUser ? <ForgotPassword /> : <Navigate to="/" />}
        />

        <Route
          path="/verify-reset"
          element={!authUser ? <VerifyReset /> : <Navigate to="/" />}
        />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}

export default App;
