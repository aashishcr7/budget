"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import API from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Compass, Plus, LogOut, User, Map } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { user, setUser, loading } = useAuth();
  const [isOpen, setIsopen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await API.post("/logout");
      setUser(null); // ← clear user from context immediately
    } finally {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsopen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getInitials = () => {
    console.log("User in Navbar:", user); // Debugging line
    const fname = user?.fname || "";
    const lname = user?.lname || "";
    return `${fname.charAt(0)}${lname.charAt(0)}`.toUpperCase();
  };

  return (
    <nav className="flex justify-between items-center px-4 sm:px-6 py-3.5 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => router.push("/dashboard")}
      >
        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-300">
          <Map className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          AI Trip Planner
        </h1>
      </div>

      <div className="flex flex-row gap-2 sm:gap-4 items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition cursor-pointer"
        >
          <Compass className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <button
          onClick={() => router.push("/create-trip")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Create Trip</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center text-sm font-semibold border-2 border-white ring-2 ring-indigo-100/50"
            onClick={() => setIsopen(!isOpen)}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 text-white border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              getInitials()
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2.5 w-52 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 transition-all duration-200">
              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl cursor-pointer text-left transition"
                onClick={() => {
                  router.push("/profile");
                  setIsopen(false);
                }}
              >
                <User className="w-4 h-4 text-slate-400" />
                My Profile
              </button>
              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl cursor-pointer text-left transition"
                onClick={() => {
                  router.push("/mytrips");
                  setIsopen(false);
                }}
              >
                <Compass className="w-4 h-4 text-slate-400" />
                My Trips
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl cursor-pointer text-left transition"
                onClick={() => {
                  handleLogout();
                  setIsopen(false);
                }}
              >
                <LogOut className="w-4 h-4 text-red-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
