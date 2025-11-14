import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

export function UserProfile() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteAccount = useMutation(api.users.deleteAccount);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleEdit = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({ name, email });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await deleteAccount();
        await signOut();
        toast.success("Account deleted successfully");
      } catch (error) {
        toast.error("Failed to delete account");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="flex items-center gap-6 mb-8">
          {user.image ? (
            <img
              src={user.image}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Profile
            </h1>
            <p className="text-gray-600">
              {user.isAnonymous ? "Anonymous User" : "Registered User"}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/20 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Name</h3>
                <p className="text-gray-800">{user.name || "Not set"}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
                <p className="text-gray-800">{user.email || "Not set"}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Account Type</h3>
                <p className="text-gray-800">{user.isAnonymous ? "Anonymous" : "Registered"}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Member Since</h3>
                <p className="text-gray-800">
                  {new Date(user._creationTime).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-white/20">
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
              >
                Edit Profile
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-semibold"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
