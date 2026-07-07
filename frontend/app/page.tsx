"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-gray-600 dark:text-gray-400">Loading...</div>
    </div>
  );
}
