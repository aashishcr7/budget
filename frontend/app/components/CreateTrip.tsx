"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import adventureImg from "../../public/images/adventure.webp";
import relaxationImg from "../../public/images/relaxation.webp";
import cultureImg from "../../public/images/culture.webp";
import familyImg from "../../public/images/family.webp";
import luxuryImg from "../../public/images/luxury.webp";
import API from "@/services/api";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Calendar,
  Wallet,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
} from "lucide-react";

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
  const searchParams = useSearchParams();
  const { loading: authLoading } = useAuth();

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
    const destination = searchParams.get("destination");
    if (destination) {
      setQuery(destination);
      setHasSelected(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasSelected) return;
    if (!query || query.length < 3) {
      setSuggestion([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const response = await axios.get<{ features: GeoapifyFeature[] }>(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=12723bd7cc58477798a0725a848d440b`,
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

  if (authLoading) return null;

  return (
    <div className="relative min-h-[calc(100vh-68px)] bg-gradient-to-br from-slate-50 via-zinc-100 to-indigo-50/20 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Wizard Card Container */}
      <div className="max-w-5xl w-full bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 md:min-h-[600px] z-10">
        
        {/* Left Side Sidebar - Gradient Info Panel */}
        <div className="md:col-span-4 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Faint card overlay pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-2 border-b border-white/10 pb-6">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold tracking-wider uppercase text-sm">AI Planner</span>
          </div>

          <div className="relative z-10 my-6 md:my-10 space-y-4 md:space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">Step 01</span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Where to next?</h2>
                <p className="text-sm text-indigo-100/90 leading-relaxed">
                  Your journey starts with a destination. Tell us where you want to go, or choose from our list of trending cities.
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">Step 02</span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Duration & Budget</h2>
                <p className="text-sm text-indigo-100/90 leading-relaxed">
                  Specify how many days your stay is and outline your estimated outlay. We will match itinerary events to your parameters.
                </p>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mt-6 border border-white/10 shadow-sm">
                  <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Selected Location</p>
                  <p className="text-sm font-bold flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-indigo-300 shrink-0" />
                    <span className="truncate">{query}</span>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">Step 03</span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Travel Style</h2>
                <p className="text-sm text-indigo-100/90 leading-relaxed">
                  Select a mood tag for your trip. This enables our AI generator to curate matching experiences, spots, and routes.
                </p>
                
                {/* Configuration Summary Badge Box */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mt-6 border border-white/10 space-y-3.5 shadow-sm">
                  <div>
                    <p className="text-[9px] text-indigo-200 font-extrabold uppercase tracking-wider">Destination</p>
                    <p className="text-xs font-bold flex items-center gap-1.5 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                      <span className="truncate">{query}</span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div>
                      <p className="text-[9px] text-indigo-200 font-extrabold uppercase tracking-wider">Duration</p>
                      <p className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                        <span>{days} {Number(days) === 1 ? "day" : "days"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-indigo-200 font-extrabold uppercase tracking-wider">Budget</p>
                      <p className="text-xs font-bold flex items-center gap-1 mt-0.5">
                        <Wallet className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                        <span>₹{Number(budget).toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative z-10 text-xs text-indigo-200 border-t border-white/10 pt-4 hidden md:block">
            “Travel makes one modest. You see what a tiny place you occupy in the world.”
          </div>
        </div>

        {/* Right Side Sidebar - Interactive Wizard Panels */}
        <div className="md:col-span-8 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white relative">
          
          {/* Steps Horizontal Bar Indicator */}
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= 1 ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-100 text-slate-400"}`}>1</div>
              <span className={`text-xs font-bold transition-colors hidden sm:inline ${step === 1 ? "text-slate-800" : "text-slate-400"}`}>Location</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-100 mx-3" />
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= 2 ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-100 text-slate-400"}`}>2</div>
              <span className={`text-xs font-bold transition-colors hidden sm:inline ${step === 2 ? "text-slate-800" : "text-slate-400"}`}>Parameters</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-100 mx-3" />
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= 3 ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-100 text-slate-400"}`}>3</div>
              <span className={`text-xs font-bold transition-colors hidden sm:inline ${step === 3 ? "text-slate-800" : "text-slate-400"}`}>Style</span>
            </div>
          </div>

          {/* Form Step Router */}
          <div className="flex-grow flex flex-col justify-center py-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 w-full"
                >
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Where are you headed?</h3>
                    <p className="text-xs text-slate-400 mt-1">Search for a destination city or point of interest.</p>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search city or location..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setHasSelected(false);
                        setSelectedPlace(null);
                      }}
                      className="w-full border border-slate-200 rounded-2xl h-14 pl-12 pr-4 shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800 font-semibold"
                    />
                    
                    {/* Dynamic Suggestions List */}
                    {suggestion.length > 0 && (
                      <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-50 p-1">
                        {suggestion.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="px-4 py-3 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition text-slate-700 text-sm font-semibold flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="truncate">{item.properties.formatted}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {suggestion.length === 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">Trending Cities</p>
                      <div className="flex flex-wrap gap-2">
                        {popularCities.map((city, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setQuery(`${city.name}, ${city.country}`);
                              setSuggestion([]);
                              setHasSelected(true);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-indigo-500 bg-slate-50/30 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-900 text-xs font-bold rounded-full cursor-pointer transition hover:scale-[1.01] active:scale-98 shadow-sm"
                          >
                            <span>{city.emoji}</span>
                            <span>{city.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (selectedPlace || hasSelected) setStep(2);
                      }}
                      disabled={!selectedPlace && !hasSelected}
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.01] active:scale-98 cursor-pointer text-sm"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 w-full"
                >
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Timeline & Budget</h3>
                    <p className="text-xs text-slate-400 mt-1">Define your travel boundaries to help customize recommendations.</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>Trip Duration (Days)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        min="1"
                        className="w-full border border-slate-200 rounded-2xl h-14 px-4 shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all text-slate-800 font-semibold"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5 pl-1">How many days will you be exploring?</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Wallet className="w-4 h-4 text-indigo-500" />
                        <span>Estimated Budget (₹)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 25000"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          min="1"
                          className="pl-9 w-full border border-slate-200 rounded-2xl h-14 px-4 shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all text-slate-800 font-semibold"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 pl-1">Estimated outlay to divide across itineraries.</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-slate-100">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-800 font-bold py-3 px-5 rounded-xl transition hover:bg-slate-50 active:scale-95 cursor-pointer text-sm"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!days || !budget || Number(days) <= 0 || Number(budget) <= 0}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.01] active:scale-98 cursor-pointer text-sm"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 w-full"
                >
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Choose your trip style</h3>
                    <p className="text-xs text-slate-400 mt-1">Select a category below that best matches your preferred travel pace.</p>
                  </div>

                  {/* Redesigned grid list of trip types */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[300px] pr-1">
                    {tripTypes.map((type) => {
                      const isSelected = tripType === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setTripType(type.id)}
                          className={`group relative overflow-hidden rounded-2xl cursor-pointer transition transform hover:scale-[1.02] active:scale-98 text-left border-2 min-h-[120px] flex flex-col justify-end ${
                            isSelected
                              ? "border-indigo-600 ring-2 ring-indigo-600/30 shadow-md"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            src={type.image}
                            alt={type.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? "bg-indigo-950/65" : "bg-black/50 hover:bg-black/40"}`} />
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5.5 h-5.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md border border-white/20">
                              <Sparkles className="w-3 h-3 fill-white text-white" />
                            </div>
                          )}

                          <div className="relative z-10 p-3 text-white">
                            <p className="text-sm font-black tracking-tight">{type.name}</p>
                            <p className="text-[9px] text-slate-200 mt-0.5 leading-snug line-clamp-2">
                              {type.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-6 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setStep(2);
                        setTripType(null);
                      }}
                      className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-800 font-bold py-3 px-5 rounded-xl transition hover:bg-slate-50 active:scale-95 cursor-pointer text-sm"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Back</span>
                    </button>
                    
                    <button
                      onClick={handleSubmit}
                      disabled={!tripType || loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.01] active:scale-98 cursor-pointer text-sm"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full shrink-0"
                          />
                          <span>Generating Plan...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Trip</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
