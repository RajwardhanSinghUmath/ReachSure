"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MapComponent from "@/components/MapComponent";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [nearestHospital, setNearestHospital] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      const fetchedHospitals = await fetchHospitals(latitude, longitude);
      setHospitals(fetchedHospitals);
      setFilteredHospitals(fetchedHospitals);

      if (fetchedHospitals.length > 0) {
        setNearestHospital(fetchedHospitals[0]);
      }
    });
  }, []);

  const fetchHospitals = async (lat, lng) => {
    const radius = 50000;
    const url = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=hospital](around:${radius},${lat},${lng});out;`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const hospitalsList = data.elements.map((hospital) => ({
        id: hospital.id,
        name: hospital.tags.name || "Unnamed Hospital",
        lat: hospital.lat,
        lng: hospital.lon,
        distance: getDistance(lat, lng, hospital.lat, hospital.lon),
      }));

      return hospitalsList.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      return [];
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = hospitals.filter((hospital) =>
      hospital.name.toLowerCase().includes(query)
    );
    setFilteredHospitals(filtered);
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
  };

  const handleProceed = () => {
    if (!name || !phone) {
      alert("Please enter your name and phone number first.");
      return;
    }

    if (!selectedHospital) {
      alert("Please select a hospital first.");
      return;
    }

    localStorage.setItem("userDetails", JSON.stringify({ name, phone }));
    localStorage.setItem("selectedHospital", JSON.stringify(selectedHospital));
    router.push("/select-ambulance");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-red-600 mb-8">🚑 Ambulance Service</h1>

      <div className="w-full max-w-md bg-gray-100 shadow-md rounded-lg p-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg mb-2"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              className="w-full p-2 border rounded-lg mb-2"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleProceed}
        className="bg-red-600 text-white w-full max-w-md px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-all mb-4"
      >
        {nearestHospital ? `Go to Nearest Hospital (${nearestHospital.name})` : "Loading..."}
      </button>

      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">🏥 Select Hospital</h2>
        <input
          type="text"
          placeholder="Search hospital..."
          className="w-full p-2 border rounded-lg mb-2"
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="max-h-60 overflow-y-auto">
          {filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                onClick={() => handleSelectHospital(hospital)}
                className={`p-2 cursor-pointer border-b ${
                  selectedHospital?.id === hospital.id ? "bg-blue-100 font-semibold" : ""
                }`}
              >
                {hospital.name} ({hospital.distance.toFixed(1)} km)
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center">No hospitals found</p>
          )}
        </div>
        <button
          onClick={handleProceed}
          className="bg-blue-600 text-white w-full mt-4 px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          Confirm Selection
        </button>
      </div>

      <div className="w-full max-w-md h-96 mt-4">
        <MapComponent hospitals={filteredHospitals} userLocation={userLocation} />
      </div>
    </div>
  );
}
