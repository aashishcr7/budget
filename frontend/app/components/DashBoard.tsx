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
    <div className="rounded-2xl p-6 shadow-lg bg-gradient-to-br from-purple-200 to-pink-200 animate-pulse">
      <div className="h-6 bg-white/50 rounded-lg w-2/3 mb-3" />
      <div className="h-4 bg-white/50 rounded w-1/3 mb-6" />
      <div className="h-3 bg-white/50 rounded w-full mb-2" />
      <div className="h-3 bg-white/50 rounded w-5/6 mb-2" />
      <div className="h-3 bg-white/50 rounded w-4/6 mb-6" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-white/50 rounded w-1/4" />
        <div className="h-8 bg-white/50 rounded-lg w-16" />
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden">
        <Image
          src={heroImage}
          alt="Travel Hero"
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Hello, {user?.fname || "Traveler"} 👋 {/* ← from context now */}
          </h1>
          <p className="text-xl mb-6">
            Where will your next adventure take you?
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition cursor-pointer text-sm sm:text-base w-fit"
            onClick={() => router.push("/create-trip")}
          >
            Plan a Trip
          </button>
        </div>
      </div>

      {/* Recommendations Section */}
      {loadingRecommendations ? (
        <div className="p-6">
          <div className="h-6 bg-gray-300 animate-pulse rounded w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecommendationSkeleton />
            <RecommendationSkeleton />
            <RecommendationSkeleton />
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="p-6">
          <p className="text-xl font-semibold mb-6 text-gray-800">
            🎯 Recommended for You
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2">{rec.destination}</h3>
                  <span className="text-sm bg-white/20 rounded-full px-3 py-1 capitalize">
                    {rec.suggested_trip_type}
                  </span>
                </div>
                <p className="text-sm mb-6 line-clamp-3 opacity-90">
                  {rec.reason}
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() =>
                      router.push(
                        `/create-trip?destination=${encodeURIComponent(rec.destination)}`,
                      )
                    }
                    className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition cursor-pointer text-sm"
                  >
                    Plan Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Popular Destinations Section */}
      <div className="p-6">
        <p className="text-xl font-semibold mb-6 text-gray-800">
          🌍 Popular Destinations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularDestinations.map((destination, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={destination.photo}
                  alt={`${destination.city} image`}
                  width={400}
                  height={400}
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="flex flex-row justify-between items-center p-6">
                <div>
                  <h2 className="text-2xl font-bold text-blue-800 mb-1">
                    {destination.city}
                  </h2>
                  <p className="text-sm font-semibold text-gray-400 uppercase">
                    {destination.State}, {destination.country}
                  </p>
                </div>
                <button
                  onClick={() =>
                    router.push(
                      `/create-trip?destination=${encodeURIComponent(`${destination.city}, ${destination.country}`)}`,
                    )
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition cursor-pointer text-sm sm:text-base"
                >
                  Plan Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
