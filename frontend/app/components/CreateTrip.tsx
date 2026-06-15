"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import Image from "next/image";
import adventureImg from "../../public/images/adventure.jpg";
import relaxationImg from "../../public/images/relaxation.jpg";
import cultureImg from "../../public/images/culture.jpg";
import familyImg from "../../public/images/family.jpg";
import luxuryImg from "../../public/images/luxury.jpg";
import createTripImage from "../../public/images/createTripImage.jpg";
import API from "@/services/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

interface GeoapifyFeature {
  properties: {
    formatted: string;
    city?: string;
    country: string;
    lat: number;
    lon: number;
    address_line1?: string;
  };
}

export default function CreateTrip() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestion, setSuggestion] = useState<GeoapifyFeature[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeoapifyFeature | null>(
    null,
  );
  const [hasSelected, setHasSelected] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [tripType, setTripType] = useState<string | null>(null);
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  // add this above your return
  const popularCities = [
    { name: "Paris", country: "France", emoji: "🗼" },
    { name: "Tokyo", country: "Japan", emoji: "🗾" },
    { name: "New York", country: "USA", emoji: "🗽" },
    { name: "Dubai", country: "UAE", emoji: "🏙️" },
    { name: "London", country: "UK", emoji: "🎡" },
    { name: "Bali", country: "Indonesia", emoji: "🌴" },
  ];

  const tripTypes = [
    {
      id: "adventure",
      name: "Adventure",
      image: adventureImg,
      description: "Hiking, sports & outdoor activities",
    },
    {
      id: "relaxation",
      name: "Relaxation",
      image: relaxationImg,
      description: "Beach, spa & wellness retreats",
    },
    {
      id: "culture",
      name: "Culture",
      image: cultureImg,
      description: "Museums, history & local experiences",
    },
    {
      id: "family",
      name: "Family",
      image: familyImg,
      description: "Culinary tours & gastronomic experiences",
    },
    {
      id: "luxury",
      name: "Luxury",
      image: luxuryImg,
      description: "High-end experiences & premium services",
    },
  ];

  useEffect(() => {
    if (hasSelected) return;

    if (!query || query.length < 3) {
      setSuggestion([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const response = await axios.get<{ features: GeoapifyFeature[] }>(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query,
          )}&apiKey=12723bd7cc58477798a0725a848d440b`,
        );

        setSuggestion(response.data.features || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query, hasSelected]);

  const handleSelect = (place: GeoapifyFeature) => {
    setSelectedPlace(place);
    setQuery(place.properties.formatted);
    setSuggestion([]);
    setHasSelected(true);
  };

  const handleContinue = () => {
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await API.post("/generate-trip", {
        location:
          selectedPlace?.properties.city ||
          selectedPlace?.properties.address_line1 ||
          query,

        full_location: query,

        lat: selectedPlace?.properties.lat,
        lon: selectedPlace?.properties.lon,

        country: selectedPlace?.properties.country,

        days: Number(days),
        budget: Number(budget),
        trip_type: tripType,
      });
      toast.success("Trip created successfully ✅");

      router.push(`/trip/${response.data.trip_id}`);
    } catch (error) {
      console.error("ERROR:", error);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "Something went wrong ❌");
      } else {
        toast.error("Something went wrong ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <Image
        src={createTripImage}
        alt="Create trip background"
        fill
        className="absolute inset-0 object-cover"
        style={{ zIndex: -1 }}
        priority
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Step 1: Destination Selection */}
      {step === 1 && (
        <div className="flex flex-col md:flex-row justify-center md:justify-around w-full px-4 md:px-10 gap-6 md:gap-0 py-8 md:py-0">
          {/* Left - Heading */}
          <div className="relative z-10 w-full md:max-w-md animate-fadeIn flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
              Plan your next adventure
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-gray-200 mb-2 leading-relaxed">
              Your journey starts with the single step.
            </p>
            <p className="text-base sm:text-lg md:text-2xl text-gray-200 mb-2 leading-relaxed">
              Lets build your itinerary together.
            </p>
          </div>

          {/* Right - Search Card */}
          <div className="relative z-10 w-full md:max-w-3xl animate-fadeIn shadow-lg rounded bg-white p-4 sm:p-6">
            <p className="text-base sm:text-lg md:text-2xl text-gray-800 mb-4 md:mb-6 leading-relaxed font-semibold">
              Where are you headed?
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-2 leading-relaxed">
              Search for a city, region or point of interest.
            </p>

            {/* Input + Dropdown wrapper */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search city..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHasSelected(false);
                  setSelectedPlace(null);
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {suggestion.length > 0 && (
                <div className="absolute w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-72 overflow-y-auto z-50">
                  {suggestion.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelect(item)}
                      className="px-4 py-3 hover:bg-blue-100 cursor-pointer transition text-gray-700 text-sm"
                    >
                      {item.properties.formatted}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Cities */}
            {suggestion.length === 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Popular Destinations
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularCities.map((city, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setQuery(`${city.name}, ${city.country}`);
                        setSuggestion([]);
                        setHasSelected(true);
                      }}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 text-xs sm:text-sm rounded-full cursor-pointer transition"
                    >
                      <span>{city.emoji}</span>
                      <span>{city.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-6 md:mt-8">
              <button
                onClick={() => {
                  if (selectedPlace || hasSelected) {
                    setStep(2);
                  }
                }}
                disabled={!selectedPlace && !hasSelected}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition cursor-pointer text-sm sm:text-base"
              >
                Next step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Date Selection */}
      {step === 2 && (
        <div className="flex flex-col md:flex-row justify-center md:justify-around w-full px-4 md:px-10 gap-6 md:gap-0 py-8 md:py-0">
          {/* Left - Info */}
          <div className="relative z-10 w-full md:max-w-md animate-fadeIn flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
              When are you going?
            </h1>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6">
              <p className="text-base sm:text-lg text-gray-100 mb-2">
                📍 Destination
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {query}
              </p>
            </div>
          </div>

          {/* Right - Calendar Card */}
          <div className="relative z-10 w-full md:max-w-3xl animate-fadeIn shadow-lg rounded bg-white p-4 sm:p-6 md:p-8">
            <p className="text-base sm:text-lg md:text-2xl text-gray-800 mb-4 md:mb-6 leading-relaxed font-semibold">
              Number of days for your trip?
            </p>

            <div className="flex justify-center mb-4 sm:mb-6">
              <input
                type="text"
                id="days"
                placeholder="Enter days"
                className="border rounded p-2 w-full text-sm sm:text-base"
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <div className="flex justify-center mb-4 sm:mb-6">
              <input
                type="text"
                id="budget"
                placeholder="Enter your budget"
                className="border rounded p-2 w-full text-sm sm:text-base"
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setStep(1);
                }}
                className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 px-4 sm:px-6 py-2 rounded-lg font-semibold transition cursor-pointer text-sm sm:text-base order-2 sm:order-1"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!days || !budget}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition cursor-pointer text-sm sm:text-base order-1 sm:order-2"
              >
                Next step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Type of Trip */}
      {step === 3 && (
        <div className="flex flex-col md:flex-row justify-center md:justify-around w-full px-4 md:px-10 gap-6 md:gap-0 py-8 md:py-0">
          {/* Left - Info */}
          <div className="relative z-10 w-full md:max-w-md animate-fadeIn flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
              What kind of trip is this?
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-200 mb-6 md:mb-8 leading-relaxed">
              Select a style to help us curate your perfect experience
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <p className="text-base sm:text-lg text-gray-100 mb-2">
                📍 Destination
              </p>
              <p className="text-lg sm:text-xl font-bold text-white mb-4">
                {query}
              </p>
              <p className="text-base sm:text-lg text-gray-100 mb-2">
                <HourglassEmptyIcon /> Days
              </p>
              <p className="text-lg sm:text-xl font-bold text-white mb-4">
                {days}
              </p>
              <p className="text-base sm:text-lg text-gray-100 mb-2">
                💰 Budget
              </p>
              <p className="text-lg sm:text-xl font-bold text-white mb-4">
                {budget}
              </p>
            </div>
          </div>

          {/* Right - Trip Type Cards */}
          <div className="relative z-10 w-full md:max-w-4xl animate-fadeIn shadow-lg rounded bg-white p-4 sm:p-6 md:p-8 md:max-h-[600px] overflow-y-auto">
            <p className="text-base sm:text-lg md:text-2xl text-gray-800 mb-4 md:mb-6 leading-relaxed font-semibold">
              Choose your trip style
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-8">
              {tripTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setTripType(type.id)}
                  className={`relative overflow-hidden rounded-2xl cursor-pointer transition transform hover:scale-105 ${
                    tripType === type.id ? "ring-4 ring-blue-500" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-32 sm:h-40 md:h-48 w-full">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover"
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Text Content */}
                    <div className="absolute bottom-0 z-10 p-2 sm:p-3 md:p-4 text-white">
                      <p className="text-lg sm:text-xl md:text-2xl font-bold">
                        {type.name}
                      </p>

                      <p className="text-xs sm:text-sm text-gray-200 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setStep(2);
                  setTripType(null);
                }}
                className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 px-4 sm:px-6 py-2 rounded-lg font-semibold transition cursor-pointer text-sm sm:text-base order-2 sm:order-1"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!tripType || loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
              >
                {loading && <HourglassEmptyIcon className="animate-spin" />}
                {loading ? "Generating Trip..." : "Generate Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
