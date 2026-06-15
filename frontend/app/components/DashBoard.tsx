"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import manali from "../../public/images/manali.webp";
import coorg from "../../public/images/coorg.webp";
import newyork from "../../public/images/newyork.webp";
import sydney from "../../public/images/sydneys.webp";
import rome from "../../public/images/rome.webp";
import jaipur from "../../public/images/jaipur.webp";

interface Destination {
  city: string;
  State: string;
  country: string;
  photo: StaticImageData;
}

export default function DashBoard() {
  const router = useRouter();
  const popularDestinations: Destination[] = [
    { city: "Manali", State: "HP", country: "India", photo: manali },
    { city: "Coorg", State: "KA", country: "India", photo: coorg },
    { city: "New York", State: "NY", country: "USA", photo: newyork },
    { city: "Sydney", State: "NSW", country: "Australia", photo: sydney },
    { city: "Rome", State: "Lazio", country: "Italy", photo: rome },
    { city: "Jaipur", State: "RJ", country: "India", photo: jaipur },
  ];
  const [user] = useState(() => {
    if (typeof window === "undefined") return null;

    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });

  return (
    <div className="bg-blue-100">
      <div className="flex flex-row items-center justify-between rounded-lg shadow-md p-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">
            Welcome, {user?.fname || "User"}
          </h1>
          <p>Start planning your next adventure!</p>
        </div>
        <div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer justify-content w-full"
            onClick={() => router.push("/create-trip")}
          >
            Plan Trip
          </button>{" "}
        </div>
      </div>
      <p className="text-xl font-semibold p-6">Popular Destinations</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {popularDestinations.map((destination, index) => {
          return (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 min-h-[400px] flex flex-col text-center"
            >
              <div className="relative overflow-hidden rounded-t-xl">
                <Image
                  src={destination.photo}
                  alt={`${destination.city} image`}
                  width={400}
                  height={400}
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              <div className="flex flex-col justify-between p-6">
                <div className="flex flex-row justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-800 mb-2">
                      {destination.city}
                    </h2>
                    <p className="font-semibold text-gray-400 mb-2 uppercase">
                      {destination.State}, {destination.country}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() =>
                      router.push(
                        `/create-trip?destination=${encodeURIComponent(
                          `${destination.city}, ${destination.country}`,
                        )}`,
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer justify-content w-[40%]"
                  >
                    Plan Trip
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
