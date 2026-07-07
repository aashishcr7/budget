"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, AlertCircle, Compass } from "lucide-react";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    resetToken?: string;
  }>({});

  useEffect(() => {
    const token =
      searchParams?.get("reset_token") || searchParams?.get("token");
    setResetToken(token);
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: {
      password?: string;
      confirmPassword?: string;
      resetToken?: string;
    } = {};

    if (!resetToken) {
      newErrors.resetToken =
        "No reset token found. Request a password reset again.";
    }

    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reset-password`,
        { reset_token: resetToken, new_password: password },
        { withCredentials: true },
      );
      toast.success("Password reset successfully! You can now log in.");
      router.push("/login");
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "Failed to reset your password.";
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
          alt="Reset password background"
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
                Reset Password
              </h1>
              <p className="text-slate-300 text-sm">
                Set a new password for your account.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors({ ...errors, password: undefined });
                    }}
                    disabled={isLoading}
                    className={inputClass(errors.password)}
                  />
                  {errors.password && (
                    <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  )}
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-400 font-medium pl-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    disabled={isLoading}
                    className={inputClass(errors.confirmPassword)}
                  />
                  {errors.confirmPassword && (
                    <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  )}
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-400 font-medium pl-1"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={isLoading || !resetToken}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!resetToken && (
                <div className="text-center text-xs text-red-300">
                  Missing reset token. Please request a password reset again.
                </div>
              )}

              <div className="text-center text-xs text-slate-400">
                Make sure both passwords match and contain at least 8
                characters.
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
