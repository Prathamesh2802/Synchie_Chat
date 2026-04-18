import { User, Mail, Ear } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { sendResetOTP } = useAuthStore();

  function validateData() {
    if (!email.trim()) {
      toast.error("Email is Required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return false;
    }
    return true;
  }

  async function ResetPassword(e) {
    try {
      e.preventDefault();
      const success = validateData();
      if (!success) return;
      const status = await sendResetOTP(email);
      if (!status) return;
      navigate("/verify-reset");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8 flex flex-col align-items-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Reset Password</h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Email
              </div>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <button
              className="btn btn-primary p-2"
              onClick={(e) => ResetPassword(e)}
            >
              Send OTP
            </button>
            <Link to={"/login"} className="btn btn-info">
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
