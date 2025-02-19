"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaAmbulance } from "react-icons/fa";

export default function AssigningDriver() {
  const [countdown, setCountdown] = useState(30); // 30 seconds countdown
  const router = useRouter();

  useEffect(() => {
    // Countdown Timer
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Redirect after 30 seconds
    const timeout = setTimeout(() => {
      router.push("/tracking");
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Assigning a Driver 🚑
      </h1>
      <p className="text-gray-600 mb-6">Please wait while we assign an ambulance...</p>

      {/* Animated Icon */}
      <div className="animate-bounce text-red-600 text-6xl mb-6">
        <FaAmbulance />
      </div>

      {/* Countdown Timer */}
      <p className="text-lg text-gray-700">
        Estimated Time: <span className="font-bold text-red-500">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}</span> seconds
      </p>

      <p className="text-gray-500 text-sm mt-4">
        This usually takes about 30 seconds. Please be patient.
      </p>
    </div>
  );
}