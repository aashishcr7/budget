"use client";
import API from "@/services/api";

export default function LogoutButton() {
  const handleLogout = async () => {
    console.log("LOGOUT BUTTON CLICKED");
    try {
      console.log("Calling API.post('/logout')");
      const response = await API.post("/logout");
      console.log("Logout response:", response);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      console.log("Redirecting to login with full page reload");
      // Force a full page reload to clear all state and re-authenticate
      window.location.href = "/login";
    }
  };

  return (
    <button
      className="bg-red-500 text-white px-4 py-2 rounded"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}
