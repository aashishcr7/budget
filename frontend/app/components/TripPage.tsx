"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/services/api";
import { motion } from "framer-motion";
import Image from "next/image";

type Day = {
  day: number;
  title: string;
  activities: string[];
  budget: number;
};

type Trip = {
  _id: string;
  location: string;
  days: number;
  budget: number;
  itinerary: { trip: Day[] };
  is_favorite?: boolean;
  image?: string;
};

export default function TripPage() {
  const { id } = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [image, setImage] = useState<string | null>(null);

  // ✅ Fetch Image (Wikipedia)
  const getImage = async (location: string) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          location,
        )}`,
      );

      if (!res.ok) return null;

      const data = await res.json();

      return data.originalimage?.source || data.thumbnail?.source || null;
    } catch (err) {
      console.error("Image Fetch Error:", err);
      return null;
    }
  };

  // ✅ Fetch Trip
  useEffect(() => {
    if (!id) return;

    const fetchTrip = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get(`/trip/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTrip(res.data);

        // If backend image exists → use it
        if (res.data.image) {
          setImage(res.data.image);
        } else {
          // Otherwise fetch from Wikipedia
          const img = await getImage(res.data.location);
          setImage(img);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };

    fetchTrip();
  }, [id]);

  // ✅ Loading UI
  if (!trip) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse text-lg">Loading trip...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 🔙 Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-500 hover:underline cursor-pointer"
      >
        ← Back
      </button>

      {/* 🖼️ HERO SECTION */}
      <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={image || "/fallback.jpg"}
          alt={trip.location ? `${trip.location} image` : "Trip image"}
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-4 left-6 text-white">
          <h1 className="text-3xl font-bold">{trip.location}</h1>
          <p className="text-sm opacity-90">
            📅 {trip.days} days • 💰 ₹{trip.budget}
          </p>
        </div>

        {/* ❤️ Favorite Button (UI only) */}
        <button className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow">
          {trip.is_favorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* 📅 TITLE */}
      <h2 className="text-2xl font-bold mt-8 mb-6">📅 Travel Itinerary</h2>

      {/* ⚠️ EMPTY STATE */}
      {trip?.itinerary?.trip?.length === 0 && (
        <p className="text-gray-500">No itinerary available</p>
      )}

      {/* 🧭 TIMELINE */}
      <div className="relative border-l-2 border-gray-300">
        {trip?.itinerary?.trip?.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="mb-8 ml-6"
          >
            {/* Dot */}
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full ring-4 ring-white" />

            {/* Card */}
            <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition">
              <h3 className="font-bold text-lg">
                Day {day.day} - {day.title}
              </h3>

              <ul className="list-disc ml-5 mt-2 text-gray-700">
                {day.activities.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>

              <p className="mt-3 text-sm text-gray-500">
                💰 Budget: ₹{day.budget}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
