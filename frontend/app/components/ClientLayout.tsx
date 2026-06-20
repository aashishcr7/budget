"use client";

import API from "@/services/api";
import Navbar from "./Navbar";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hideNavbar = pathname === "/login" || pathname === "/signup";
  const publicPaths = ["/login", "/signup"];
  const isPublicPage = publicPaths.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("CHECKING AUTH - pathname:", pathname);
      try {
        const result = await API.get("/me");
        console.log("AUTH CHECK PASSED - User:", result.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.log("AUTH CHECK FAILED - Not authenticated");
        console.error("Error during auth check:", error);
        setIsLoggedIn(false);
        // If not logged in and trying to access protected page, redirect to login
        if (!isPublicPage) {
          console.log("Redirecting to login from:", pathname);
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, isPublicPage]);

  if (isLoading && !isPublicPage) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!hideNavbar && isLoggedIn && <Navbar />}

      {/* 🔥 MAIN LAYOUT CONTROL */}
      <main
        className={`flex-1 ${
          pathname === "/login" || pathname === "/signup"
            ? "" // dashboard normal layout
            : ""
        }`}
      >
        {children}
      </main>
    </>
  );
}
