"use client";

import Navbar from "./Navbar";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/otp-verify";

  return (
    <AuthProvider>
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
    </AuthProvider>
  );
}
