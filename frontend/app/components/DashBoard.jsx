"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import Model from "./Model";

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
      <div className="p-4 flex gap-4">
        <input
          type="text"
          placeholder="Enter the text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded mb-4"
        >
          <option value="latest">Latest</option>
          <option value="budgetLow">Budget Low → High</option>
          <option value="budgetHigh">Budget High → Low</option>
        </select>
      </div>
      <button
        onClick={() => setFav(!fav)}
        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg mb-2 shadow cursor-pointer"
      >
        {fav ? "Show All" : "Show Favorites"}
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
              <div key={index} className="bg-white rounded-xl shadow-md p-4">
                <img
                  src={images[trip.location] || "/fallback.jpg"}
                  className="w-full h-40 object-cover"
                />
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{trip.location}</h2>

                  <button
                    onClick={() => toggleFavorite(trip._id)}
                    className="text-2xl cursor-pointer"
                  >
                    {trip.is_favourite ? "❤️" : "🤍"}
                  </button>
                </div>
                <p>Days: {trip.days}</p>
                <p>Budget: ₹{trip.budget}</p>

                {/* Itinerary */}
                {/* {parsedItinerary?.trip?.map((day) => (
                  <div key={day.day} className="mt-3 p-4 bg-blue-50 rounded">
                    <h3 className="font-bold">
                      Day {day.day} - {day.title}
                    </h3>

                    <ul className="list-disc ml-5 mt-2">
                      {day.activities.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>

                    <p className="text-sm mt-2">Budget: ₹{day.budget}</p>
                  </div>
                ))} */}
                <div className="flex gap-4">
                  {/* View Page */}
                  <button
                    className="mt-3 bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
                    onClick={() => router.push(`/trip/${trip._id}`)}
                  >
                    View Page
                  </button>

                  {/* Delete button */}
                  <button
                    className="mt-3 bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
                    onClick={() => {
                      setSelectedTrip(trip._id);
                      setShowModel(true);
                    }}
                  >
                    Delete
                  </button>
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
