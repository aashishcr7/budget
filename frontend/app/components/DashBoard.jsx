"use client";
import { useEffect, useState } from "react";
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

export default function DashBoard() {
  const router = useRouter();
  const [tripData, setTripData] = useState([]); // ✅ fix
  const [images, setImages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [fav, setFav] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchTrips = async () => {
      try {
        const response = await API.get("/my-trips", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send token
          },
        });

        setTripData(response.data.trips);

        // 🔥 Fetch images
        const trips = response.data.trips;
        setTripData(trips);

        const imgMap = {};
        // Use Promise.all to fetch all images at once (much faster than a for loop!)
        await Promise.all(
          trips.map(async (trip) => {
            const img = await getImage(trip.location);
            imgMap[trip.location] = img;
          }),
        );

        setImages({ ...imgMap });
      } catch (error) {
        console.error("ERROR:", error);

        if (error.response) {
          alert(error.response.data.detail);
        } else {
          alert("Something went wrong ❌");
        }
      }
    };

    fetchTrips();
  }, []);

  const getImage = async (location) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(location)}`,
      );
      if (!res.ok) return null; // Handle 404s
      const data = await res.json();

      // Wikipedia returns 'originalimage' or 'thumbnail'
      return data.originalimage?.source || data.thumbnail?.source || null;
    } catch (err) {
      console.error("Image Fetch Error:", err);
      return null;
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.put(
        `/trip/${id}/favourites`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 🔥 Update UI instantly
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

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await API.delete(`/trip/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔥 Remove from UI
      setTripData((prev) => prev.filter((trip) => trip._id !== id));
      setShowModel(false);
    } catch (error) {
      console.error(error);
      alert("Delete failed ❌");
    }
  };

  const filteredTrips = tripData
    .filter((trip) => {
      const matchesSearch = trip.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFav = fav ? trip.is_favourite : true;

      return matchesSearch && matchesFav;
    })
    .sort((a, b) => {
      if (sortBy === "budgetLow") return a.budget - b.budget;
      if (sortBy === "budgetHigh") return b.budget - a.budget;
      return 0;
    });

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex flex-row justify-between">
        <div>
          <p className="text-2xl font-semibold">Recent Searches</p>
          <p className="text-sm text-gray-600">
            Continue exploring your dream search
          </p>
        </div>
        <div className="p-2 flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <Input
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 flex-1 min-w-[220px] rounded-2xl border border-slate-200 shadow-sm px-4 text-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-400"
          />

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-slate-600">Sort by:</span>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 w-44 rounded-2xl border border-slate-200 shadow-sm px-4">
                <SelectValue placeholder="Latest" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="budgetLow">Budget: Low to High</SelectItem>
                <SelectItem value="budgetHigh">Budget: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <button
        onClick={() => setFav(!fav)}
        className={`group relative overflow-hidden px-6 py-3 my-4 rounded-2xl font-semibold text-white transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
          fav
            ? "bg-gradient-to-r from-blue-200 to-indigo-800"
            : "bg-gradient-to-r from-blue-500 to-indigo-600"
        }`}
      >
        {/* Glow Effect */}
        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

        {/* Button Text */}
        <span className="relative flex items-center gap-2">
          {fav ? <>❤️ Show All Trips</> : <>✨ Show Favorites</>}
        </span>
      </button>
      {filteredTrips.length === 0 ? (
        // 🟡 EMPTY STATE
        <div className="flex flex-col items-center justify-center mt-20">
          <h2 className="text-2xl font-semibold text-gray-600">
            No trips yet 😔
          </h2>

          <p className="text-gray-500 mt-2">
            Start planning your next adventure!
          </p>

          <button
            onClick={() => router.push("/create-trip")}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow cursor-pointer"
          >
            Create Your First Trip ✈️
          </button>
        </div>
      ) : (
        // 🟢 SHOW TRIPS
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, index) => {
            // let parsedItinerary;

            // try {
            //   parsedItinerary = trip.itinerary;
            // } catch (e) {
            //   parsedItinerary = { trip: [] };
            // }

            return (
              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 min-h-[500px] flex flex-col"
              >
                {/* Image Section */}
                <div className="relative overflow-hidden">
                  <img
                    src={images[trip.location] || "/fallback.jpg"}
                    className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                  />

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(trip._id)}
                    className="absolute top-4 right-4 text-3xl backdrop-blur-md bg-white/30 rounded-full w-12 h-12 flex items-center justify-center hover:scale-110 transition"
                  >
                    {trip.is_favourite ? "❤️" : "🤍"}
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between flex-1 p-6">
                  <div>
                    {/* Location Name */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      {trip.location}
                    </h2>

                    {/* Info Pills */}
                    <div className="flex gap-4 mb-5 flex-wrap">
                      <p className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                        ⏳ {trip.days} Days
                      </p>

                      <p className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                        💰 ₹{trip.budget}
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 mt-8">
                    {/* View Button */}
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                      onClick={() => router.push(`/trip/${trip._id}`)}
                    >
                      View Trip
                    </button>

                    {/* Delete Button */}
                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                      onClick={() => {
                        setSelectedTrip(trip._id);
                        setShowModel(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModel ? (
        <Model
          onConfirm={() => handleDelete(selectedTrip)}
          onCancel={() => setShowModel(false)}
        />
      ) : null}
    </div>
  );
}
