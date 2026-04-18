import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { User, Mail, Camera, Contact, EyeOff, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router";

function UpdateProfile() {
  const navigate = useNavigate();
  const { authUser, UpdateDetails } = useAuthStore();
  // const [showoldPassword, setOldPassword] = useState(false);
  // const [shownewPassword, setNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser.fullName,
    password: "",
    confirmPassword: "",
  });

  function validateData() {
    if (!formData.fullName.trim()) {
      toast.error("Full Name is Required");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Old Password is required");
      return false;
    }

    if (formData.password.trim().length < 8) {
      toast.error("Old Password must be of 8 characters");
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      toast.error("New Password is required");
      return false;
    }

    if (formData.confirmPassword.trim().length < 8) {
      toast.error("New Password must be of 8 characters");
      return false;
    }

    return true;
  }

  async function updateDetails(e) {
    try {
      e.preventDefault();
      const success = validateData();
      if (!success) return;
      const status = await UpdateDetails(formData);
      if (!status) return;
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8 flex flex-col align-items-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Update Details</h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Old Password
              </div>
              <input
                type={"password"}
                className={`input input-bordered w-full`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                New Password
              </div>
              <input
                type={"password"}
                className={`input input-bordered w-full`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <button
              className="btn btn-primary p-2"
              onClick={(e) => updateDetails(e)}
            >
              Update Details
            </button>
            <Link to={"/profile"} className="btn btn-info">
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile;
