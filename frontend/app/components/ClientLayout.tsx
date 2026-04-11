"use client";

import Navbar from "./Navbar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }: any) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const hideNavbar = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      {!hideNavbar && isLoggedIn && <Navbar />}

      {/* 🔥 MAIN LAYOUT CONTROL */}
      <main
        className={`flex-1 px-6 py-6 ${
          pathname === "/dashboard"
            ? "" // dashboard normal layout
            : "flex justify-center items-center"
        }`}
      >
        {children}
      </main>
    </>
  );
}
