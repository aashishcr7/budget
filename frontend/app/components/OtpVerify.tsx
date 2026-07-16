"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Key, ArrowRight, AlertCircle, Compass } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function OtpVerify() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});
  const searchParams = useSearchParams();
  const purpose = searchParams.get("purpose"); // "signup" | "reset"

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; otp?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!otp || !/^\d{4,6}$/.test(otp)) {
      newErrors.otp = "Enter the 4-6 digit verification code";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const endpoint =
        purpose === "signup" ? "/verify-otp" : "/verify-reset-otp";

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        { email, otp },
        { withCredentials: true },
      );

      if (purpose === "signup") {
        toast.success("Email verified! You can now log in.");
        router.push("/login");
      } else {
        const resetToken = res.data.reset_token;
        toast.success("OTP verified successfully!");
        router.push(
          `/reset-password?reset_token=${encodeURIComponent(resetToken)}`,
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "OTP verification failed.";
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
          alt="OTP verification background"
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
                Verify OTP
              </h1>
              <p className="text-slate-300 text-sm">
                Enter the code sent to your email to complete verification.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors({ ...errors, email: undefined });
                    }}
                    disabled={isLoading}
                    className={inputClass(errors.email)}
                  />
                  {errors.email && (
                    <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  )}
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-400 font-medium pl-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="otp"
                  className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (errors.otp) setErrors({ ...errors, otp: undefined });
                    }}
                    disabled={isLoading}
                    className={inputClass(errors.otp)}
                  />
                  {errors.otp && (
                    <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  )}
                </div>
                <AnimatePresence>
                  {errors.otp && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-400 font-medium pl-1"
                    >
                      {errors.otp}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-400">
                Didn’t receive a code? Check your spam folder or request it
                again from the signup flow.
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
