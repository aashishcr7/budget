"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/services/api";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Wallet,
  MapPin,
  Compass,
  CheckCircle2,
  Sparkles,
  Clock,
} from "lucide-react";

type Day = {
  day: number;
  title: string;
  activities: string[];
  budget: number;
};

type Trip = {
  _id: string;
  destination: {
    city: string;
    country?: string;
    full_location?: string;
  };
  days: number;
  budget: number;
  trip_type?: string;
  itinerary: { trip: Day[] };
  is_favorite?: boolean;
  image?: string;
};

export default function TripPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const getImage = async (city: string) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.originalimage?.source || data.thumbnail?.source || null;
    } catch (err) {
      console.error("Image Fetch Error:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!id) return;
    if (authLoading) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchTrip = async () => {
      try {
        const res = await API.get(`/trip/${id}`);
        setTrip(res.data);
        if (res.data.image) {
          setImage(res.data.image);
        } else {
          const img = await getImage(res.data.destination.city);
          setImage(img);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        router.push("/login");
      }
    };

    fetchTrip();
  }, [id, authLoading]);

  if (authLoading) return null;

  // Loading skeleton
  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-indigo-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <Compass className="w-8 h-8 text-indigo-500 animate-spin" style={{ animationDuration: "2s" }} />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Loading your adventure...</p>
        </motion.div>
      </div>
    );
  }

  const totalDays = trip?.itinerary?.trip?.length || trip.days;
  const dailyAvg = totalDays > 0 ? Math.round(trip.budget / totalDays) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-indigo-50/20">
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={`${trip.destination.city} image`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900" />
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/10" />

        {/* Back button */}
        <div className="absolute top-5 left-5 sm:top-7 sm:left-8 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-semibold py-2.5 px-4 rounded-2xl transition cursor-pointer text-sm shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-7 z-10">
          {trip.destination.country && (
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{trip.destination.country}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            {trip.destination.city}
          </h1>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              {trip.days} {trip.days === 1 ? "Day" : "Days"}
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <Wallet className="w-3.5 h-3.5 text-emerald-300" />
              {"\u20B9"}{trip.budget?.toLocaleString("en-IN")}
            </span>
            {trip.trip_type && (
              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {trip.trip_type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

        {/* Stats Overview Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: <Calendar className="w-5 h-5 text-indigo-600" />,
              bg: "bg-indigo-50",
              label: "Total Days",
              value: `${trip.days} Days`,
            },
            {
              icon: <Wallet className="w-5 h-5 text-emerald-600" />,
              bg: "bg-emerald-50",
              label: "Total Budget",
              value: `\u20B9${trip.budget?.toLocaleString("en-IN")}`,
            },
            {
              icon: <Clock className="w-5 h-5 text-purple-600" />,
              bg: "bg-purple-50",
              label: "Daily Average",
              value: `\u20B9${dailyAvg.toLocaleString("en-IN")}`,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Itinerary Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Travel Itinerary
            </h2>
          </div>

          {(!trip?.itinerary?.trip || trip.itinerary.trip.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-sm text-center">
              <Compass className="w-10 h-10 text-indigo-400 mb-3 animate-bounce" />
              <p className="text-slate-500 font-medium">No itinerary available yet.</p>
            </div>
          )}

          {/* Vertical Timeline */}
          <div className="relative">
            {/* Timeline spine */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 via-purple-200 to-transparent rounded-full" />

            <div className="space-y-6">
              {trip?.itinerary?.trip?.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 90, damping: 18 }}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-5 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100 shrink-0 z-10">
                    <span className="text-white text-xs font-extrabold">{day.day}</span>
                  </div>

                  {/* Day card */}
                  <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group hover:border-indigo-100">
                    {/* Day header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">
                          Day {day.day}
                        </p>
                        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight group-hover:text-indigo-950 transition-colors">
                          {day.title}
                        </h3>
                      </div>
                      {/* Budget badge */}
                      <div className="shrink-0 flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-2xl">
                        <Wallet className="w-3 h-3" />
                        <span>{"\u20B9"}{day.budget?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Activities */}
                    <ul className="space-y-2.5">
                      {day.activities.map((act, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-slate-600"
                        >
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-4 pb-8"
        >
          <button
            onClick={() => router.push("/mytrips")}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition shadow-md shadow-indigo-100 hover:shadow-indigo-200 hover:scale-[1.02] active:scale-95 cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Trips
          </button>
        </motion.div>
      </div>
    </div>
  );
}
