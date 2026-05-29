"use client";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { useState, FormEvent } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import LocalAirportIcon from "@mui/icons-material/LocalAirport";

export default function SignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword || confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/signup", {
        email,
        password,
        fname: firstName,
        lname: lastName,
      });

      console.log(response.data);
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "Signup failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between overflow-hidden p-4 md:p-12 gap-4 md:gap-12">
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
      <div className="relative z-10 bg-white rounded-4xl shadow-2xl w-full max-w-md p-8 md:p-12 flex flex-col bg-[#7d7de38f] mt-12 ml-12">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LocalAirportIcon className="text-3xl md:text-4xl font-bold text-blue-800 mr-2 mb-2" />
            <p className="text-xl md:text-2xl font-bold text-blue-800 mr-2 mb-2">
              AI Trip Planner
            </p>
          </div>
          <p className="text-gray-600 text-sm">
            Your AI companion for smarter travel
          </p>
        </div>
        <div className="mb-4 px-4">
          <span className="text-3xl md:text-3xl font-bold text-black-800 mr-2 mb-2">
            Create
          </span>
          <span className="text-3xl md:text-3xl font-bold text-purple-800 mb-2">
            Account
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {" "}
          {/* First Name & Last Name */}{" "}
          <div className="grid grid-cols-2 gap-4">
            {" "}
            <div className="flex flex-col gap-2">
              {" "}
              <label htmlFor="fname" className="font-semibold text-gray-700">
                {" "}
                First Name{" "}
              </label>{" "}
              <input
                id="fname"
                type="text"
                placeholder="John"
                className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-white"}`}
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName)
                    setErrors({ ...errors, firstName: undefined });
                }}
                disabled={isLoading}
                required
              />{" "}
              {errors.firstName && (
                <span className="text-sm text-red-600 font-medium">
                  {" "}
                  {errors.firstName}{" "}
                </span>
              )}{" "}
            </div>{" "}
            <div className="flex flex-col gap-2">
              {" "}
              <label htmlFor="lname" className="font-semibold text-gray-700">
                {" "}
                Last Name{" "}
              </label>{" "}
              <input
                id="lname"
                type="text"
                placeholder="Doe"
                className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-white"}`}
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName)
                    setErrors({ ...errors, lastName: undefined });
                }}
                disabled={isLoading}
                required
              />{" "}
              {errors.lastName && (
                <span className="text-sm text-red-600 font-medium">
                  {" "}
                  {errors.lastName}{" "}
                </span>
              )}{" "}
            </div>{" "}
          </div>{" "}
          {/* Email */}{" "}
          <div className="flex flex-col gap-2">
            {" "}
            <label htmlFor="email" className="font-semibold text-gray-700">
              {" "}
              Email Address{" "}
            </label>{" "}
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-white"}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              disabled={isLoading}
              required
            />{" "}
            {errors.email && (
              <span className="text-sm text-red-600 font-medium">
                {" "}
                {errors.email}{" "}
              </span>
            )}{" "}
          </div>{" "}
          {/* Password */}{" "}
          <div className="flex flex-col gap-2">
            {" "}
            <label htmlFor="password" className="font-semibold text-gray-700">
              {" "}
              Password{" "}
            </label>{" "}
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-white"}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              disabled={isLoading}
              required
            />{" "}
            {errors.password && (
              <span className="text-sm text-red-600 font-medium">
                {" "}
                {errors.password}{" "}
              </span>
            )}{" "}
          </div>{" "}
          {/* Confirm Password */}{" "}
          <div className="flex flex-col gap-2">
            {" "}
            <label
              htmlFor="confirmPassword"
              className="font-semibold text-gray-700"
            >
              {" "}
              Confirm Password{" "}
            </label>{" "}
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-white"}`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: undefined });
              }}
              disabled={isLoading}
              required
            />{" "}
            {errors.confirmPassword && (
              <span className="text-sm text-red-600 font-medium">
                {" "}
                {errors.confirmPassword}{" "}
              </span>
            )}{" "}
          </div>{" "}
          {/* Button */}{" "}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 mt-2 cursor-pointer"
            disabled={isLoading}
          >
            {" "}
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                {" "}
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                Creating account...{" "}
              </span>
            ) : (
              "Create Account"
            )}{" "}
          </button>{" "}
          {/* Divider */}{" "}
          <div className="relative">
            {" "}
            <div className="absolute inset-0 flex items-center">
              {" "}
              <div className="w-full border-t border-gray-300" />{" "}
            </div>{" "}
            <div className="relative flex justify-center text-sm">
              {" "}
              <span className="px-2 bg-white text-gray-500">
                {" "}
                Already have an account?{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          {/* Login */}{" "}
          <button
            type="button"
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 cursor-pointer"
            onClick={() => router.push("/login")}
            disabled={isLoading}
          >
            {" "}
            Login Instead{" "}
          </button>{" "}
        </form>
      </div>

      {/* Quote Section */}
      <div className="relative z-10 hidden md:flex flex-col max-w-lg mt-12 mr-12">
        <p className="text-white text-center text-lg">
          Travel is the only <br /> thing you buy that <br /> makes you richer.
        </p>
      </div>
    </div>
  );
}
