"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import { toast } from "react-toastify";

interface ProfileData {
  fname: string;
  lname: string;
  email: string;
}

export default function Profile() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    fname: "",
    lname: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await API.get("/profile");

        setProfileData(response.data);
        setFormData({
          fname: response.data.fname,
          lname: response.data.lname,
          email: response.data.email,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      await API.put("/profile", formData);

      setProfileData(formData);
      setIsEditing(false);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fname: profileData.fname,
      lname: profileData.lname,
      email: profileData.email,
    });
    setIsEditing(false);
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials =
    `${profileData.fname[0]}${profileData.lname[0]}`.toUpperCase();

  return (
    <div className=" py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />

          {/* Profile Content */}
          <div className="px-6 md:px-12 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center -mt-16 mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
                {initials}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-6">
              {isEditing ? (
                // Edit Mode
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="fname"
                        value={formData.fname}
                        onChange={handleInputChange}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lname"
                        value={formData.lname}
                        onChange={handleInputChange}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // View Mode
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {profileData.fname} {profileData.lname}
                        </p>
                      </div>
                    </div>

                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {profileData.email}
                      </p>
                    </div>

                    <div className="pb-4">
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
