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

  const [query, setQuery] = useState<string>("");
  const [suggestion, setSuggestion] = useState<GeoapifyFeature[]>([]);
  const [step, setStep] = useState<number>(1);
  const [tripType, setTripType] = useState<string | null>(null);
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GeoapifyFeature | null>(
    null,
  );

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
    if (!query || query.length < 3) {
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const response = await axios.get<{ features: GeoapifyFeature[] }>(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=12723bd7cc58477798a0725a848d440b`,
        );
        setSuggestion(response.data.features || []);
        console.log("Geoapify Suggestions:", response.data.features);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (place: GeoapifyFeature) => {
    setSelectedPlace(place);
    setQuery(place.properties.formatted);
    setSuggestion([]);
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
      console.log("Generated Trip:", response.data);

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
    <div className="relative h-screen w-full flex items-center justify-center">
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
        <div className="flex flex-row justify-around w-full px-10">
          {/* Left - Heading */}
          <div className="relative z-10 max-w-md animate-fadeIn">
            <h1 className="text-5xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Plan your next adventure
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-2 leading-relaxed">
              Your journey starts with the single step.
            </p>
            <p className="text-lg md:text-2xl text-gray-200 mb-2 leading-relaxed">
              Lets build your itinerary together.
            </p>
          </div>

          {/* Right - Search Card */}
          <div className="relative z-10 max-w-3xl w-full animate-fadeIn shadow-lg rounded bg-white p-6">
            <p className="text-lg md:text-2xl text-gray-800 mb-6 leading-relaxed font-semibold">
              Where are you headed?
            </p>
            <p className="text-sm md:text-base text-gray-500 mb-2 leading-relaxed">
              Search for a city, region or point of interest.
            </p>

            {/* Input + Dropdown wrapper */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
                        setSelectedPlace(null);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 text-sm rounded-full cursor-pointer transition"
                    >
                      <span>{city.emoji}</span>
                      <span>{city.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-8">
              <button
                onClick={() => query.trim() && setStep(2)}
                disabled={!query.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition cursor-pointer"
              >
                Next step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Date Selection */}
      {step === 2 && (
        <div className="flex flex-row justify-around w-full px-10">
          {/* Left - Info */}
          <div className="relative z-10 max-w-md animate-fadeIn">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              When are you going?
            </h1>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6">
              <p className="text-lg text-gray-100 mb-2">📍 Destination</p>
              <p className="text-2xl font-bold text-white">{query}</p>
            </div>
          </div>

          {/* Right - Calendar Card */}
          <div className="relative z-10 max-w-3xl w-full animate-fadeIn shadow-lg rounded bg-white p-8">
            <p className="text-lg md:text-2xl text-gray-800 mb-6 leading-relaxed font-semibold">
              Number of days for your trip?
            </p>

            <div className="flex justify-center mb-6">
              <input
                type="text"
                id="days"
                placeholder="Enter days"
                className="border rounded p-2 w-full"
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <div className="flex justify-center mb-6">
              <input
                type="text"
                id="budget"
                placeholder="Enter your budget"
                className="border rounded p-2 w-full"
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={() => {
                  setStep(1);
                }}
                className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 px-6 py-2 rounded-lg font-semibold transition cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition cursor-pointer"
              >
                Next step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Type of Trip */}
      {step === 3 && (
        <div className="flex flex-row justify-around w-full px-10">
          {/* Left - Info */}
          <div className="relative z-10 max-w-md animate-fadeIn">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              What kind of trip is this?
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Select a style to help us curate your perfect experience
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <p className="text-lg text-gray-100 mb-2">📍 Destination</p>
              <p className="text-xl font-bold text-white mb-4">{query}</p>
              <p className="text-lg text-gray-100 mb-2">
                <HourglassEmptyIcon /> Days
              </p>
              <p className="text-xl font-bold text-white mb-4">{days}</p>
              <p className="text-lg text-gray-100 mb-2">💰 Budget</p>
              <p className="text-xl font-bold text-white mb-4">{budget}</p>
            </div>
          </div>

          {/* Right - Trip Type Cards */}
          <div className="relative z-10 max-w-4xl w-full animate-fadeIn shadow-lg rounded bg-white p-8 max-h-[600px]">
            <p className="text-lg md:text-2xl text-gray-800 mb-6 leading-relaxed font-semibold">
              Choose your trip style
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {tripTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setTripType(type.id)}
                  className={`relative overflow-hidden rounded-2xl cursor-pointer transition transform hover:scale-105 ${
                    tripType === type.id ? "ring-4 ring-blue-500" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 w-full">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover"
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Text Content */}
                    <div className="absolute bottom-0 z-10 p-4 text-white">
                      <p className="text-2xl font-bold">{type.name}</p>

                      <p className="text-sm text-gray-200 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={() => {
                  setStep(2);
                  setTripType(null);
                }}
                className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 px-6 py-2 rounded-lg font-semibold transition cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!tripType || loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-2"
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
