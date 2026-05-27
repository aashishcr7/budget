"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
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

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("https://budget-jd2w.onrender.com/login", {
        email,
        password: pass,
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // ⬅️ Store user data
      // document.cookie = `token=${res.data.access_token}; path=/; max-age=86400`;

      toast.success("Login successful");
      router.push("/dashboard");
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
    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50 hover:bg-white"
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <span className="text-sm text-red-600 font-medium">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-semibold text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50 hover:bg-white"
                }`}
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  if (errors.password)
                    setErrors({ ...errors, password: undefined });
                }}
                disabled={isLoading}
                required
              />
              {errors.password && (
                <span className="text-sm text-red-600 font-medium">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New user?</span>
              </div>
            </div>

            {/* Signup */}
            <button
              type="button"
              className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 cursor-pointer"
              onClick={() => router.push("/signup")}
              disabled={isLoading}
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Image Section */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center">
          <Image
            src="/images/login.jpg"
            alt="Login form background"
            width={500}
            height={600}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
