"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import Model from "./Model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import HikingIcon from "@mui/icons-material/Hiking";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import FestivalIcon from "@mui/icons-material/Festival";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import DiamondIcon from "@mui/icons-material/Diamond";
import { SvgIconComponent } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Heart,
  Calendar,
  MapPin,
  TrendingUp,
  Wallet,
  Compass,
  Trash2,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

interface Destination {
  city: string;
  full_location?: string;
  country: string;
}

interface Trip {
  _id: string;
  destination: Destination;
  days: number;
  trip_type: string;
  budget: number;
  is_favourite: boolean;
}

type SortOption = "latest" | "budgetLow" | "budgetHigh";

export default function MyTrips() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [tripData, setTripData] = useState<Trip[]>([]);
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [fav, setFav] = useState<boolean>(false);
  const [showModel, setShowModel] = useState<boolean>(false);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const tripTypeIcons: Record<string, SvgIconComponent> = {
    adventure: HikingIcon,
    culture: FestivalIcon,
    relaxation: SelfImprovementIcon,
    family: FamilyRestroomIcon,
    luxury: DiamondIcon,
  };

  const tagStyles: Record<string, { bg: string; text: string; border: string }> = {
    adventure: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-200/50" },
    culture: { bg: "bg-purple-50/80", text: "text-purple-700", border: "border-purple-200/50" },
    relaxation: { bg: "bg-sky-50/80", text: "text-sky-700", border: "border-sky-200/50" },
    family: { bg: "bg-blue-50/80", text: "text-blue-700", border: "border-blue-200/50" },
    luxury: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-200/50" },
  };

  const getImage = async (location: string): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(location)}`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.originalimage?.source || data.thumbnail?.source || null;
    } catch (err) {
      console.error("Image Fetch Error:", err);
      return null;
    }
  };

  const getTripImage = (city: string, tripType: string) => {
    const wikiImage = images[city];
    if (wikiImage) return wikiImage;

    const cityLower = city.toLowerCase();
    if (cityLower.includes("manali")) return "/images/manali.webp";
    if (cityLower.includes("coorg")) return "/images/coorg.webp";
    if (cityLower.includes("new york") || cityLower.includes("nyc")) return "/images/newyork.webp";
    if (cityLower.includes("sydney")) return "/images/sydneys.webp";
    if (cityLower.includes("rome")) return "/images/rome.webp";
    if (cityLower.includes("jaipur")) return "/images/jaipur.webp";

    const typeLower = tripType.toLowerCase();
    if (typeLower.includes("adventure")) return "/images/adventure.webp";
    if (typeLower.includes("culture")) return "/images/culture.webp";
    if (typeLower.includes("family")) return "/images/family.webp";
    if (typeLower.includes("luxury")) return "/images/luxury.webp";
    if (typeLower.includes("relaxation")) return "/images/relaxation.webp";

    return "/images/hero.webp";
  };

  useEffect(() => {
    if (authLoading) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchTrips = async () => {
      try {
        const response = await API.get("/my-trips");
        const trips: Trip[] = response.data.trips;
        setTripData(trips);

        const imgMap: Record<string, string | null> = {};
        await Promise.all(
          trips.map(async (trip) => {
            const img = await getImage(trip.destination.city);
            imgMap[trip.destination.city] = img;
          }),
        );
        setImages({ ...imgMap });
      } catch (error) {
        console.error("Error fetching trips:", error);
        router.push("/login");
      }
    };

    fetchTrips();
  }, [authLoading]);

  if (authLoading) return null;

  const toggleFavorite = async (id: string): Promise<void> => {
    try {
      const res = await API.put(`/trip/${id}/favourites`, {});
      setTripData((prev) =>
        prev.map((trip) =>
          trip._id === id
            ? { ...trip, is_favourite: res.data.is_favourite }
            : trip,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update favorite ❌");
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await API.delete(`/trip/${id}`);
      setTripData((prev) => prev.filter((trip) => trip._id !== id));
      setShowModel(false);
    } catch (error) {
      console.error(error);
      alert("Delete failed ❌");
    }
  };

  const filteredTrips = tripData
    .filter((trip) => {
      const city = trip?.destination?.city || "";
      const matchesSearch = city
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFav = fav ? trip?.is_favourite : true;
      return matchesSearch && matchesFav;
    })
    .sort((a, b) => {
      const budgetA = a?.budget || 0;
      const budgetB = b?.budget || 0;
      if (sortBy === "budgetLow") return budgetA - budgetB;
      if (sortBy === "budgetHigh") return budgetB - budgetA;
      return 0;
    });

  // Calculate statistics for the stats dashboard
  const totalTrips = tripData.length;
  const totalFavs = tripData.filter((t) => t.is_favourite).length;
  const totalEstimatedBudget = tripData.reduce((sum, t) => sum + (t.budget || 0), 0);

  // Framer-motion layout animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-indigo-50/20 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">

        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 bg-clip-text text-transparent flex items-center gap-2">
              <Compass className="w-8 h-8 text-indigo-600 animate-spin-slow" />
              <span>My Planned Adventures</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Keep track of your itineraries, budgets, and favorite travel destinations all in one high-fidelity space.
            </p>
          </div>

          <button
            onClick={() => router.push("/create-trip")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-5 rounded-2xl transition shadow-md shadow-indigo-100 hover:shadow-indigo-200 hover:scale-[1.02] active:scale-95 cursor-pointer text-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Plan a New Trip</span>
          </button>
        </div>

        {/* Stats Dashboard Row */}
        {totalTrips > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Trips</p>
                <h3 className="text-2xl font-extrabold text-slate-800">{totalTrips}</h3>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <Heart className="w-6 h-6 fill-rose-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Favorites</p>
                <h3 className="text-2xl font-extrabold text-slate-800">{totalFavs}</h3>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Outlay</p>
                <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-0.5">
                  <span className="text-emerald-600 text-lg font-bold">₹</span>
                  {totalEstimatedBudget.toLocaleString("en-IN")}
                </h3>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search & Filters Glass-Panel */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search adventures by city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 w-full rounded-2xl border border-slate-200 shadow-inner text-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort:</span>
              <Select
                value={sortBy}
                onValueChange={(val) => setSortBy(val as SortOption)}
              >
                <SelectTrigger className="h-12 w-44 rounded-2xl border border-slate-200 shadow-sm px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer transition">
                  <SelectValue placeholder="Latest" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-xl border border-slate-100 p-1 bg-white">
                  <SelectItem value="latest" className="rounded-xl cursor-pointer">Latest Planned</SelectItem>
                  <SelectItem value="budgetLow" className="rounded-xl cursor-pointer">Budget: Low to High</SelectItem>
                  <SelectItem value="budgetHigh" className="rounded-xl cursor-pointer">Budget: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Favorite Filter Toggle */}
            <button
              onClick={() => setFav(!fav)}
              className={`group flex items-center gap-2 h-12 px-5 rounded-2xl font-semibold border transition cursor-pointer active:scale-95 ${fav
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-md shadow-pink-100 hover:shadow-lg"
                  : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
            >
              <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${fav ? "fill-white text-white" : "text-rose-500"}`} />
              <span>{fav ? "Showing Favorites" : "Favorites Only"}</span>
            </button>
          </div>
        </div>

        {/* Trips Display Grid */}
        {filteredTrips.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-sm"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500 mb-6 animate-bounce">
              <Compass className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No adventures found</h2>
            <p className="text-slate-500 mt-2 text-sm text-center max-w-sm px-4">
              {searchTerm || fav
                ? "We couldn't find any trips matching your search filters. Try clearing your search or favorite tags."
                : "Your travel folder is looking light. Start planning your next dream destination!"}
            </p>
            {(searchTerm || fav) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFav(false);
                }}
                className="mt-6 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl shadow-sm cursor-pointer font-semibold text-sm transition"
              >
                Clear All Filters
              </button>
            )}
            {!searchTerm && !fav && (
              <button
                onClick={() => router.push("/create-trip")}
                className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-md cursor-pointer font-semibold text-sm transition hover:scale-102 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Your First Trip ✈️</span>
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTrips.map((trip) => {
              const Icon: SvgIconComponent | null = tripTypeIcons[trip.trip_type] || null;
              const typeStyle = tagStyles[trip.trip_type.toLowerCase()] || {
                bg: "bg-slate-50",
                text: "text-slate-700",
                border: "border-slate-200",
              };

              return (
                <motion.div
                  key={trip._id}
                  variants={itemVariants}
                  className="group relative bg-white border border-slate-100/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col min-h-[460px] group/card hover:border-indigo-100"
                >
                  {/* Decorative faint glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 via-transparent to-purple-50/15 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Image Header with Overlays */}
                  <div className="relative h-60 overflow-hidden shrink-0">
                    <img
                      src={getTripImage(trip.destination.city, trip.trip_type)}
                      alt={trip.destination.city}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                      onError={(e) => {
                        // Safe ultimate fallback in case of loading error
                        (e.target as HTMLImageElement).src = "/images/hero.webp";
                      }}
                    />

                    {/* Shadow overlay at bottom of image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/10" />

                    {/* Days Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-800 font-extrabold px-3 py-1.5 rounded-2xl text-[11px] shadow-sm border border-slate-100/50 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{trip.days} {trip.days === 1 ? "Day" : "Days"}</span>
                    </div>

                    {/* Favorite Heart Trigger */}
                    <button
                      onClick={() => toggleFavorite(trip._id)}
                      className="absolute top-4 right-4 text-sm backdrop-blur-md bg-white/80 hover:bg-white border border-slate-100/50 rounded-full w-10 h-10 flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition cursor-pointer text-red-500"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${trip.is_favourite ? "fill-rose-500 text-rose-500" : "text-slate-500"
                          }`}
                      />
                    </button>
                  </div>

                  {/* Card Content Area */}
                  <div className="flex-grow p-6 flex flex-col justify-between relative z-10">
                    <div className="space-y-4">
                      {/* Location & Title */}
                      <div>
                        <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {trip.destination.full_location
                              ?.split(",")[1]
                              ?.trim() || trip.destination.country}
                          </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 truncate group-hover/card:text-indigo-950 transition-colors">
                          {trip.destination.city}
                        </h2>
                      </div>

                      {/* Type Badge Tag */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border} capitalize w-fit`}
                      >
                        {Icon && <Icon style={{ fontSize: "14px" }} />}
                        <span>{trip.trip_type}</span>
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      {/* Budget Container Panel */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-inner">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Budget</p>
                          <p className="text-lg font-black text-slate-800 mt-0.5 flex items-center gap-0.5">
                            <span className="text-emerald-500 text-sm font-bold">₹</span>
                            {trip.budget?.toLocaleString("en-IN") || "N/A"}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                          <Wallet className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex gap-3">
                        <button
                          className="flex-grow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm hover:shadow-md hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                          onClick={() => router.push(`/trip/${trip._id}`)}
                        >
                          <span>Explore Trip</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition cursor-pointer shrink-0"
                          onClick={() => {
                            setSelectedTrip(trip._id);
                            setShowModel(true);
                          }}
                          title="Delete trip plan"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {showModel && selectedTrip && (
          <Model
            onConfirm={() => handleDelete(selectedTrip)}
            onCancel={() => setShowModel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
