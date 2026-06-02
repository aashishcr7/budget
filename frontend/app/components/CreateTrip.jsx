"use client";

import API from "../../services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CreateTrip() {
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await API.post("/generate-trip", {
        location: location,
        days: Number(days),
        budget: Number(budget),
      });

      console.log(response.data);

      toast.success("Trip created successfully ✅");

      router.push("/dashboard");
    } catch (error) {
      console.error("ERROR:", error);

      if (error.response) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Something went wrong ❌");
      }
    }
  };
  return (
    <div className="flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-semibold mb-6">Create Trip</h1>

      <div className="border rounded-lg shadow-md w-full max-w-md p-6">
        {/* Location */}
        <div className="flex flex-col gap-2">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            placeholder="Enter your Location"
            className="border rounded p-2 w-full"
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Days + Budget */}
        <div className="flex gap-4 mt-4">
          <div className="flex flex-col gap-2 w-1/2">
            <label htmlFor="days">Days</label>
            <input
              type="text"
              id="days"
              placeholder="Enter days"
              className="border rounded p-2 w-full"
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 w-1/2">
            <label htmlFor="budget">Budget</label>
            <input
              type="text"
              id="budget"
              placeholder="Enter your budget"
              className="border rounded p-2 w-full"
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        {/* Button */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 mt-6 w-full transition cursor-pointer"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
