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
import heroImage from "../../public/images/hero.webp";

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
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden">
        {/* Background Image */}
        <Image
          src={heroImage}
          alt="Travel Hero"
          className="w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Hello, {user?.fname || "Traveler"} 👋
          </h1>

          <p className="text-xl mb-6">
            Where will your next adventure take you?
          </p>

          <button
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition cursor-pointer text-sm sm:text-base w-fit"
            onClick={() => router.push("/create-trip")}
          >
            Plan Trip
          </button>
        </div>
      </div>
      <p className="text-xl font-semibold p-6">Popular Destinations</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {popularDestinations.map((destination, index) => {
          return (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 min-h-[250px] flex flex-col text-center"
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

              <div className="flex flex-row justify-between p-6">
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
                <div className="flex justify-center">
                  <button
                    onClick={() =>
                      router.push(
                        `/create-trip?destination=${encodeURIComponent(
                          `${destination.city}, ${destination.country}`,
                        )}`,
                      )
                    }
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition cursor-pointer text-sm sm:text-base w-fit"
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
