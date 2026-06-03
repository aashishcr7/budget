"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsopen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Close dropdown when clicking outside
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
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const fname = user.fname || "";
    const lname = user.lname || "";
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

        {/* Profile button with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer flex items-center justify-center text-lg font-semibold"
            onClick={() => setIsopen(!isOpen)}
          >
            {getInitials()}
          </button>

          {/* The dropdown menu */}
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
