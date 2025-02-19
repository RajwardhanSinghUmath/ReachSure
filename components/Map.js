"use client"
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const START_LOCATION = [17.9749, 79.6036];
const PATIENT_LOCATION = [17.9817, 79.5332];
const HOSPITAL_LOCATION = [17.9522, 79.5955];

const ANIMATION_SPEED = 200; // milliseconds

const RouteTracker = ({ startPoint, endPoint, onProgress, onDestinationReached }) => {
  const map = useMap();
  const [routePoints, setRoutePoints] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startPoint[1]},${startPoint[0]};${endPoint[1]},${endPoint[0]}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoutePoints(coordinates);
          map.fitBounds(coordinates, { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
    setCurrentPosition(0); // Reset position when route changes
  }, [startPoint, endPoint]);

  useEffect(() => {
    if (!routePoints.length) return;

    const interval = setInterval(() => {
      setCurrentPosition(prev => {
        if (prev >= routePoints.length - 1) {
          clearInterval(interval);
          setTimeout(() => onDestinationReached(), 0); // Prevent direct state update in render
          return prev;
        }
        const progress = (prev + 1) / (routePoints.length - 1);
        setTimeout(() => onProgress(progress), 0); // Prevent direct state update in render
        return prev + 1;
      });
    }, ANIMATION_SPEED);

    return () => clearInterval(interval);
  }, [routePoints]);

  if (!routePoints.length) return null;

  const completedRoute = routePoints.slice(0, currentPosition + 1);
  const pendingRoute = routePoints.slice(currentPosition);
  const currentLocation = routePoints[currentPosition] || routePoints[0];

  return (
    <>
      <Marker 
        position={currentLocation}
        icon={L.divIcon({
          html: '🚑',
          className: 'text-2xl',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })}
      />
      <Polyline positions={completedRoute} pathOptions={{ color: '#22c55e', weight: 4 }} />
      <Polyline positions={pendingRoute} pathOptions={{ color: '#ef4444', weight: 4 }} />
    </>
  );
};

const MapComponent = () => {
  const [progress, setProgress] = useState(0);
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [showPickup, setShowPickup] = useState(false);
  const [currentStart, setCurrentStart] = useState(START_LOCATION);
  const [currentEnd, setCurrentEnd] = useState(PATIENT_LOCATION);
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);

  useEffect(() => {
    const fetchRouteInfo = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${currentStart[1]},${currentStart[0]};${currentEnd[1]},${currentEnd[0]}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          setEstimatedDistance(data.routes[0].distance / 1000);
          setEstimatedDuration(Math.ceil(data.routes[0].duration / 60));
        }
      } catch (error) {
        console.error('Error fetching route info:', error);
      }
    };

    fetchRouteInfo();
  }, [currentStart, currentEnd]);

  const handleDestinationReached = () => {
    if (!isPickedUp) {
      setShowPickup(true);
    } else {
      alert('Reached hospital!');
    }
  };

  const handlePickupConfirm = () => {
    setIsPickedUp(true);
    setShowPickup(false);
    setProgress(0);
    setCurrentStart(PATIENT_LOCATION);
    setCurrentEnd(HOSPITAL_LOCATION);
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer center={[17.9689, 79.5941]} zoom={13} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {!isPickedUp && (
          <Marker 
            position={PATIENT_LOCATION}
            icon={L.divIcon({
              html: '📌',
              className: 'text-2xl',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })}
          />
        )}
        
        <Marker 
          position={HOSPITAL_LOCATION}
          icon={L.divIcon({
            html: '🏥',
            className: 'text-2xl',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })}
        />
        
        <RouteTracker
          startPoint={currentStart}
          endPoint={currentEnd}
          onProgress={setProgress}
          onDestinationReached={handleDestinationReached}
        />
      </MapContainer>

      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg w-80">
        <div className="text-center font-semibold mb-3">
          {isPickedUp ? 'En Route to Hospital' : 'En Route to Patient'}
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full mb-3">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <div>
            <div className="text-gray-500">DISTANCE</div>
            <div className="font-semibold">
              {((1 - progress) * estimatedDistance).toFixed(1)} km
            </div>
          </div>
          <div>
            <div className="text-gray-500">ETA</div>
            <div className="font-semibold">
              {Math.ceil((1 - progress) * estimatedDuration)} min
            </div>
          </div>
        </div>
      </div>

      {showPickup && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg w-80 text-center">
          <h3 className="font-semibold mb-2">Arrived at Patient Location</h3>
          <p className="text-gray-600 mb-4">Please confirm when patient is onboard</p>
          <button 
            onClick={handlePickupConfirm}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
          >
            Confirm Pickup
          </button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
