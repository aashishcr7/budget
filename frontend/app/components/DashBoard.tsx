"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import manali from "../../public/images/manali.webp";
import coorg from "../../public/images/coorg.webp";
import newyork from "../../public/images/newyork.webp";
import sydney from "../../public/images/sydneys.webp";
import rome from "../../public/images/rome.webp";
import jaipur from "../../public/images/jaipur.webp";
import heroImage from "../../public/images/hero.webp";
import API from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, MapPin, Compass, ArrowRight } from "lucide-react";

interface Destination {
  city: string;
  State: string;
  country: string;
  photo: StaticImageData;
}

interface Recommendation {
  destination: string;
  reason: string;
  suggested_trip_type: string;
  estimated_budget: number;
}

function RecommendationSkeleton() {
  return (
    <div className="rounded-2xl p-6 shadow-sm border border-slate-100 bg-white animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-2/3">
          <div className="h-6 bg-slate-200 rounded-md w-full" />
          <div className="h-4 bg-slate-200 rounded-md w-1/3" />
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-16" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
        <div className="h-3 bg-slate-200 rounded w-4/6" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded-xl w-24" />
      </div>
    </div>
  );
}

export default function DashBoard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // ← replaces localStorage

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const hasFetched = useRef(false); // ← prevents double fetch in StrictMode

  const popularDestinations: Destination[] = [
    { city: "Manali", State: "HP", country: "India", photo: manali },
    { city: "Coorg", State: "KA", country: "India", photo: coorg },
    { city: "New York", State: "NY", country: "USA", photo: newyork },
    { city: "Sydney", State: "NSW", country: "Australia", photo: sydney },
    { city: "Rome", State: "Lazio", country: "Italy", photo: rome },
    { city: "Jaipur", State: "RJ", country: "India", photo: jaipur },
  ];

  useEffect(() => {
    if (authLoading) return; // ← wait for auth to resolve
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const response = await API.get("/recommendations");
        setRecommendations(response.data.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [authLoading]); // ← re-run when auth resolves

  // ← prevents flash while auth is being checked
  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-indigo-50/20 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Hero Section */}
        <div className="relative w-full h-[300px] sm:h-[420px] rounded-3xl overflow-hidden shadow-lg group">
          <Image
            src={heroImage}
            alt="Travel Hero"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 text-white">
            <span className="bg-indigo-500/20 backdrop-blur-md text-indigo-300 font-semibold tracking-wider text-[11px] sm:text-xs uppercase border border-indigo-500/30 rounded-full px-3 py-1 mb-4 w-fit flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Explore, Plan, Travel</span>
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-2 sm:mb-3">
              Hello, {user?.fname || "Traveler"} 👋
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-200/90 mb-6 max-w-md sm:max-w-xl">
              Where will your next adventure take you? Let's plan it together.
            </p>
            <button
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] cursor-pointer text-sm sm:text-base w-fit flex items-center gap-2"
              onClick={() => router.push("/create-trip")}
            >
              <Sparkles className="w-4 h-4 sm:w-5 h-5" />
              <span>Plan a Trip</span>
            </button>
          </div>
        </div>

        {/* Recommendations Section */}
        {loadingRecommendations ? (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="h-6 bg-slate-200 animate-pulse rounded w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RecommendationSkeleton />
              <RecommendationSkeleton />
              <RecommendationSkeleton />
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Recommended for You
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="group relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-purple-50/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-snug group-hover:text-indigo-900 transition-colors">
                        {rec.destination}
                      </h3>
                      <span className="shrink-0 text-[11px] font-semibold tracking-wider text-indigo-600 bg-indigo-50/80 rounded-full px-2.5 py-1 capitalize border border-indigo-100/30">
                        {rec.suggested_trip_type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>
                  
                  <div className="relative z-10 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Est. Budget</span>
                      <span className="text-base font-extrabold text-slate-800 flex items-center gap-0.5">
                        <span className="text-indigo-600 text-sm font-semibold">₹</span>
                        {rec.estimated_budget?.toLocaleString('en-IN') || 'N/A'}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/create-trip?destination=${encodeURIComponent(rec.destination)}`,
                        )
                      }
                      className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer text-sm"
                    >
                      <span>Plan Trip</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Popular Destinations Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Popular Destinations
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((destination, index) => (
              <div
                key={index}
                className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-100/50 transition-all duration-300 flex flex-col"
              >
                <div className="relative overflow-hidden h-52">
                  <Image
                    src={destination.photo}
                    alt={`${destination.city} image`}
                    width={400}
                    height={400}
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-indigo-600 mb-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {destination.State}, {destination.country}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-900 transition-colors">
                      {destination.city}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        `/create-trip?destination=${encodeURIComponent(`${destination.city}, ${destination.country}`)}`,
                      )
                    }
                    className="w-full text-center bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white py-2.5 rounded-xl font-semibold transition duration-300 cursor-pointer text-sm shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Explore Destination</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
