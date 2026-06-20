"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import API from "@/services/api";
import { useAuth } from "@/context/AuthContext";

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
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow sticky top-0 z-10">
      <h1 className="text-xl font-bold">AI Trip Planner</h1>
      <div className="flex flex-row gap-4 items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer hover:underline"
        >
          Dashboard
        </button>
        <button
          onClick={() => router.push("/create-trip")}
          className="cursor-pointer hover:underline"
        >
          Create Trip
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer flex items-center justify-center text-lg font-semibold"
            onClick={() => setIsopen(!isOpen)}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 text-white border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              getInitials()
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
              <button
                className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left"
                onClick={() => {
                  router.push("/profile");
                  setIsopen(false);
                }}
              >
                My Profile
              </button>
              <div className="border-t border-gray-200" />
              <button
                className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left"
                onClick={() => {
                  router.push("/mytrips");
                  setIsopen(false);
                }}
              >
                My Trips
              </button>
              <div className="border-t border-gray-200" />
              <button
                className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left"
                onClick={() => {
                  handleLogout();
                  setIsopen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
