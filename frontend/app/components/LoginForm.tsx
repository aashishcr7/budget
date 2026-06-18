"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import LocalAirportIcon from "@mui/icons-material/LocalAirport";

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
      const res = await axios.post("http://budget-jd2w.onrender.com/login", {
        email,
        password: pass,
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

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
    <div className="relative min-h-screen flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between overflow-hidden p-4 sm:p-6 md:p-8 lg:p-12 gap-2 sm:gap-4 md:gap-8 lg:gap-12">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/loggin.png"
          alt="Login form background"
          fill
          className="object-cover object-[center_35%]"
          priority
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Form Section */}
      <div className="relative z-10 bg-white rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md p-4 sm:p-6 md:p-8 md:ml-12 lg:ml-12 flex flex-col bg-[#7d7de38f] mt-4 sm:mt-8 md:mt-12">
        <div className="mb-4 sm:mb-6 text-center">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
            <LocalAirportIcon className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800" />
            <p className="text-sm sm:text-lg md:text-xl font-bold text-blue-800">
              AI Trip Planner
            </p>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm">
            Your AI companion for smarter travel
          </p>
        </div>
        <div className="mb-4 px-2 sm:px-4">
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-black-800 block">
            Welcome
          </span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-800 block">
            Back
          </span>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Sign in to continue your journey
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-2 sm:space-y-4 p-2 sm:p-4"
        >
          {/* Email */}
          <div className="flex flex-col gap-1 sm:gap-2">
            <label
              htmlFor="email"
              className="font-semibold text-xs sm:text-sm md:text-base text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              <span className="text-xs sm:text-sm text-red-600 font-medium">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 sm:gap-2">
            <label
              htmlFor="password"
              className="font-semibold text-xs sm:text-sm md:text-base text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              <span className="text-xs sm:text-sm text-red-600 font-medium">
                {errors.password}
              </span>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2 sm:py-3 text-xs sm:text-sm md:text-base rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 cursor-pointer mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>

          {/* Divider */}
          <div className="relative my-2 sm:my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-white text-gray-500">New user?</span>
            </div>
          </div>

          {/* Signup */}
          <button
            type="button"
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-2 sm:py-3 text-xs sm:text-sm md:text-base rounded-lg hover:border-blue-500 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 cursor-pointer"
            onClick={() => router.push("/signup")}
            disabled={isLoading}
          >
            Create Account
          </button>
        </form>
      </div>

      {/* Quote Section */}
      <div className="relative z-10 hidden md:flex flex-col max-w-sm lg:max-w-lg md:mt-12 md:mr-8 lg:mr-12">
        <p className="text-white text-center text-base md:text-lg lg:text-xl">
          Travel is the only <br /> thing you buy that <br /> makes you richer.
        </p>
      </div>
    </div>
  );
}
