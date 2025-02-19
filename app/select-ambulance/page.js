"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectAmbulance() {
  const [ambulances, setAmbulances] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const hospital = JSON.parse(localStorage.getItem("selectedHospital"));
      if (!hospital) {
        alert("No hospital selected. Redirecting to hospital selection...");
        router.push("/");
        return;
      }
      setSelectedHospital(hospital);
      fetchAmbulances();
    } catch (error) {
      console.error("❌ Error loading localStorage data:", error);
    }
  }, []);

  const fetchAmbulances = () => {
    const availableAmbulances = [
      { id: 1, type: "BLS", price: "₹500 - ₹700", service: "City Ambulance" },
      { id: 4, type: "BLS -with EMT", price: "₹1500 - ₹1700", service: "City Ambulance" },
      { id: 2, type: "ALS - with EMT", price: "₹2000 - ₹2500", service: "LifeCare EMS" },
      { id: 3, type: "ALS - without EMT", price: "₹1000 - ₹1500", service: "MediFast" },
    ];
    setAmbulances(availableAmbulances);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-red-700 mb-6">
        Available Ambulances near {selectedHospital?.name || "your location"}
      </h1>

      {ambulances.length === 0 ? (
        <p className="text-gray-500">Loading ambulances...</p>
      ) : (
        <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
          {ambulances.map((ambulance) => (
            <button
              key={ambulance.id}
              className="w-full flex justify-between items-center bg-red-500 text-white px-5 py-4 rounded-lg shadow-md hover:bg-red-600 transition-all my-3"
              onClick={() => router.push("/assigning-driver")}
            >
              <div className="text-left">
                <span className="font-bold text-lg">{ambulance.type}</span>
                <p className="text-sm opacity-90">{ambulance.service}</p>
              </div>
              <span className="font-bold text-lg">{ambulance.price}</span>
            </button>
          ))}
        </div>
      )}

      {/* Information Section */}
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-red-700 mb-4">Ambulance Types Explained</h2>

        <div className="mb-5">
          <h3 className="font-bold text-gray-800">🚑 Basic Life Support (BLS)</h3>
          <p className="text-gray-700 text-sm">
            Used for non-critical patients. Includes oxygen, basic first aid, and a trained driver.
          </p>
        </div>

        <div className="mb-5">
          <h3 className="font-bold text-gray-800">🩺 Advanced Life Support (ALS)</h3>
          <p className="text-gray-700 text-sm">
            For serious emergencies. Equipped with cardiac monitors, IV supplies, ventilators, and medications.
          </p>
        </div>

        <div className="mb-5">
          <h3 className="font-bold text-gray-800">👨‍⚕️ EMT (Emergency Medical Technician)</h3>
          <p className="text-gray-700 text-sm">
            ALS ambulances may have an EMT, a trained medical expert who can perform CPR, administer drugs, and handle trauma cases.
          </p>
        </div>
      </div>
    </div>
  );
}