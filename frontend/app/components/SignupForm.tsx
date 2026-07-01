"use client";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { useState, FormEvent } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Compass,
  ArrowRight,
  AlertCircle,
  LogIn,
} from "lucide-react";

export default function SignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email address";
    if (!password || password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword || confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        email,
        password,
        fname: firstName,
        lname: lastName,
      });
      toast.success("Account created! Welcome aboard ✈️");
      router.push("/login");
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail || axiosError.message || "Signup failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable field styles
  const inputClass = (hasError?: string) =>
    `w-full pl-4 pr-10 py-3 rounded-2xl text-sm font-medium bg-white/10 border backdrop-blur-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-400/60 focus:ring-red-400/30 bg-red-500/10"
        : "border-white/20 hover:border-white/30 focus:ring-indigo-400/30 focus:border-indigo-400/60"
    }`;

  return (
    <div className="relative min-h-screen flex items-center justify-start overflow-hidden px-6 sm:px-12 lg:px-20">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/loggin.png"
          alt="Signup background"
          fill
          className="object-cover object-[center_35%]"
          priority
        />
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
        className="relative z-10 w-full max-w-md my-8"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-slate-950/40 overflow-hidden">

          {/* Top accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500" />

          <div className="px-8 pt-8 pb-10 space-y-6">
            {/* Brand header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-extrabold text-lg tracking-tight">AI Trip Planner</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Create account
              </h1>
              <p className="text-slate-300 text-sm">
                Join and start planning your next adventure
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* First name & Last name */}
              <div className="grid grid-cols-2 gap-3">
                {/* First name */}
                <div className="space-y-1.5">
                  <label htmlFor="fname" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-400" />
                    First
                  </label>
                  <div className="relative">
                    <input
                      id="fname"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                      }}
                      disabled={isLoading}
                      className={inputClass(errors.firstName)}
                    />
                    {errors.firstName && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.firstName && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-red-400 font-medium pl-1"
                      >
                        {errors.firstName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Last name */}
                <div className="space-y-1.5">
                  <label htmlFor="lname" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-400" />
                    Last
                  </label>
                  <div className="relative">
                    <input
                      id="lname"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                      }}
                      disabled={isLoading}
                      className={inputClass(errors.lastName)}
                    />
                    {errors.lastName && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.lastName && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-red-400 font-medium pl-1"
                      >
                        {errors.lastName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
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
                      if (errors.email) setErrors({ ...errors, email: undefined });
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

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    disabled={isLoading}
                    className={inputClass(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    disabled={isLoading}
                    className={inputClass(errors.confirmPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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

              {/* Create Account button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer text-sm mt-1"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-400 font-medium">Already a member?</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Login button */}
              <button
                type="button"
                onClick={() => router.push("/login")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-semibold py-3.5 rounded-2xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm backdrop-blur-sm"
              >
                <LogIn className="w-4 h-4 text-indigo-300" />
                Sign In Instead
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-[11px] text-slate-500">
              By creating an account, you agree to our{" "}
              <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition">Terms</span>
              {" & "}
              <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition">Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* Travel quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-400 text-sm mt-6 italic px-4"
        >
          "The world is a book and those who do not travel read only one page."
        </motion.p>
      </motion.div>
    </div>
  );
}
