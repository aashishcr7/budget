"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, ArrowRight, AlertCircle, Compass } from "lucide-react";

export default function ForgetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/forget-password`,
        { email },
        { withCredentials: true },
      );
      toast.success("Password reset link sent to your email!");
      router.push(
        `/otp-verify?email=${encodeURIComponent(email)}&purpose=reset`,
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "Failed to send reset link.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError?: string) =>
    `w-full pl-4 pr-10 py-3.5 rounded-2xl text-sm font-medium bg-white/10 border backdrop-blur-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-400/60 focus:ring-red-400/30 bg-red-500/10"
        : "border-white/20 hover:border-white/30 focus:ring-indigo-400/30 focus:border-indigo-400/60"
    }`;

  return (
    <div className="relative min-h-screen flex items-center justify-start overflow-hidden px-6 sm:px-12 lg:px-20">
      <div className="absolute inset-0">
        <Image
          src="/images/loggin.png"
          alt="Forgot password background"
          fill
          className="object-cover object-[center_35%]"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-purple-900/30" />
      </div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md my-10"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-slate-950/40 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500" />
          <div className="px-8 pt-8 pb-10 space-y-7">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-extrabold text-lg tracking-tight">
                  AI Trip Planner
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Forgot Password
              </h1>
              <p className="text-slate-300 text-sm">
                Enter your email to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                    className={inputClass(errors.email)}
                  />
                  <Mail className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-slate-400 text-sm">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
