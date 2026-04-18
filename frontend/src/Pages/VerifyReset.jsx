import { useState } from "react";
import { User, Lock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router";
import toast from "react-hot-toast";

function VerifyReset() {
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();

  const token = sessionStorage.getItem("resetToken");
  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  function validate() {
    if (!formData.otp.trim()) {
      toast.error("OTP required");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Password required");
      return false;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    await resetPassword({
      token,
      otp: formData.otp,
      password: formData.password,
    });

    sessionStorage.removeItem("resetToken");

    navigate("/login");
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8 flex flex-col align-items-center">
          <form onSubmit={handleSubmit} className="p-4 space-y-2">
            <div className="text-center">
              <h1 className="text-2xl font-semibold ">
                Verify OTP and Password
              </h1>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Email
                </div>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="input input-bordered w-full"
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password
                </div>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  className="input input-bordered w-full"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input input-bordered w-full"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button type="submit" className="btn btn-primary p-2">
                Reset Password
              </button>
              <Link to={"/login"} className="btn btn-info">
                Back
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyReset;
