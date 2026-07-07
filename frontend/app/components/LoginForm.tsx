"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Compass,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!pass || pass.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        { email, password: pass },
        { withCredentials: true },
      );
      toast.success("Welcome back! ✈️");
      window.location.href = "/dashboard";
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-start overflow-hidden px-6 sm:px-12 lg:px-20">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/loggin.png"
          alt="Login background"
          fill
          className="object-cover object-[center_35%]"
          priority
        />
        {/* Layered overlays for depth */}
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-purple-900/30" />
      </div>

      {/* Floating decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-slate-950/40 overflow-hidden">
          {/* Top accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500" />

          <div className="px-8 pt-8 pb-10 space-y-7">
            {/* Brand header */}
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
                Welcome back
              </h1>
              <p className="text-slate-300 text-sm">
                Sign in to continue your adventure
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Email field */}
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
                    className={`w-full pl-4 pr-10 py-3.5 rounded-2xl text-sm font-medium bg-white/10 border backdrop-blur-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? "border-red-400/60 focus:ring-red-400/30 bg-red-500/10"
                        : "border-white/20 hover:border-white/30 focus:ring-indigo-400/30 focus:border-indigo-400/60"
                    }`}
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
                      className="text-xs text-red-400 font-medium pl-1 flex items-center gap-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={pass}
                    onChange={(e) => {
                      setPass(e.target.value);
                      if (errors.password)
                        setErrors({ ...errors, password: undefined });
                    }}
                    disabled={isLoading}
                    className={`w-full pl-4 pr-12 py-3.5 rounded-2xl text-sm font-medium bg-white/10 border backdrop-blur-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? "border-red-400/60 focus:ring-red-400/30 bg-red-500/10"
                        : "border-white/20 hover:border-white/30 focus:ring-indigo-400/30 focus:border-indigo-400/60"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p
                onClick={() => router.push("/forget-password")}
                className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                Forget Password
              </p>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-400 font-medium">
                  New here?
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Sign up button */}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-semibold py-3.5 rounded-2xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Create an Account
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-[11px] text-slate-500">
              By signing in, you agree to our{" "}
              <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition">
                Terms
              </span>
              {" & "}
              <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>

        {/* Travel quote below card */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-400 text-sm mt-6 italic px-4"
        >
          &quot;Travel is the only thing you buy that makes you richer.&quot;
        </motion.p>
      </motion.div>
    </div>
  );
}
