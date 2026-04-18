import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

function VerifyOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");

  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  const { verifyOtp, resendOtp } = useAuthStore();

  if (!email) {
    return <Navigate to="/register" />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const verified = await verifyOtp({
      email,
      otp,
    });

    if (verified) {
      navigate("/");
    }
  }

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-3xl">
      <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg p-8">
        <h1 className="text-2xl font-bold">Verify OTP</h1>

        <p className="mb-4">OTP sent to {email}</p>

        <form onSubmit={handleSubmit}>
          <input
            className="input input-bordered w-full mb-4"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button className="btn btn-primary w-full">Verify OTP</button>
        </form>

        <button
          onClick={() => resendOtp(email)}
          className="btn btn-outline w-full mt-4"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}

export default VerifyOtp;
