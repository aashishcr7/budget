"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  CalendarDays,
  Pencil,
  X,
  Check,
  ArrowLeft,
  ShieldCheck,
  Compass,
  Sparkles,
} from "lucide-react";

interface ProfileData {
  fname: string;
  lname: string;
  email: string;
  created_at?: string;
}

export default function Profile() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    fname: "",
    lname: "",
    email: "",
    created_at: undefined,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
  });

  useEffect(() => {
    if (authLoading) return;

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
  }, [authLoading]);

  if (authLoading) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-indigo-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <Compass className="w-8 h-8 text-indigo-500 animate-spin" style={{ animationDuration: "2s" }} />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  const initials = `${profileData.fname?.[0] ?? ""}${profileData.lname?.[0] ?? ""}`.toUpperCase();
  const fullName = `${profileData.fname} ${profileData.lname}`.trim();
  const memberSince = profileData.created_at
    ? new Date(profileData.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  function handleSave() {
    setIsSaving(true);
    API.put("/profile", formData)
      .then(() => {
        setProfileData(formData);
        setIsEditing(false);
        toast.success("Profile updated successfully ✨");
      })
      .catch(() => toast.error("Failed to update profile ❌"))
      .finally(() => setIsSaving(false));
  }

  function handleCancel() {
    setFormData({
      fname: profileData.fname,
      lname: profileData.lname,
      email: profileData.email,
    });
    setIsEditing(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-indigo-50/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm"
        >
          {/* Cover banner */}
          <div className="relative h-36 bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-700 overflow-hidden rounded-t-3xl">
            {/* Subtle decorative orbs */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-4 right-5 flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Travel Planner
            </div>
          </div>

          {/* Avatar + Name */}
          <div className="px-6 sm:px-10 pb-8 pt-0">
            {/* Avatar row — only avatar gets negative margin to overlap banner */}
            <div className="-mt-14 mb-4 relative z-10">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold border-4 border-white shadow-xl shadow-indigo-200 shrink-0">
                {initials}
              </div>
            </div>

            {/* Edit / Save / Cancel buttons — sits cleanly below the banner */}
            <div className="flex justify-end mb-6">
              <div className="flex gap-3">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="edit-actions"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-2"
                    >
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold py-2.5 px-4 rounded-2xl text-sm transition cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-2xl text-sm transition shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="edit-btn"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 px-5 rounded-2xl text-sm transition shadow-md shadow-indigo-100 cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Profile
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Content: View or Edit */}
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        First Name
                      </label>
                      <input
                        type="text"
                        name="fname"
                        value={formData.fname}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fname: e.target.value }))}
                        className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition text-sm font-medium"
                        placeholder="First name"
                      />
                    </div>
                    {/* Last Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lname"
                        value={formData.lname}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lname: e.target.value }))}
                        className="px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition text-sm font-medium"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  {/* Email (disabled) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-100 text-slate-400 cursor-not-allowed text-sm font-medium"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-400 font-semibold bg-slate-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Locked
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-1">Email address cannot be changed.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view-mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {[
                    {
                      icon: <User className="w-4 h-4 text-indigo-500" />,
                      bg: "bg-indigo-50",
                      label: "Full Name",
                      value: fullName || "—",
                      valueClass: "text-xl font-extrabold text-slate-800",
                    },
                    {
                      icon: <Mail className="w-4 h-4 text-purple-500" />,
                      bg: "bg-purple-50",
                      label: "Email Address",
                      value: profileData.email || "—",
                      valueClass: "text-base font-semibold text-slate-700 break-all",
                    },
                    {
                      icon: <CalendarDays className="w-4 h-4 text-emerald-500" />,
                      bg: "bg-emerald-50",
                      label: "Member Since",
                      value: memberSince,
                      valueClass: "text-base font-semibold text-slate-700",
                    },
                  ].map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 transition-all"
                    >
                      <div className={`w-10 h-10 rounded-xl ${row.bg} flex items-center justify-center shrink-0`}>
                        {row.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{row.label}</p>
                        <p className={row.valueClass}>{row.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick links row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => router.push("/mytrips")}
            className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200/60 hover:border-indigo-200 hover:bg-white rounded-2xl p-4 text-slate-600 hover:text-indigo-600 font-semibold text-sm transition shadow-sm hover:shadow-md cursor-pointer group"
          >
            <Compass className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            My Trips
          </button>
          <button
            onClick={() => router.push("/create-trip")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl p-4 text-white font-semibold text-sm transition shadow-md shadow-indigo-100 hover:shadow-indigo-200 cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Plan a New Trip
          </button>
        </motion.div>

      </div>
    </div>
  );
}
