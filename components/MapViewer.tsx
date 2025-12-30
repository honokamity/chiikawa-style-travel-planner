
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, Navigation } from 'lucide-react';

interface Props {
  location: string;
}

const MapViewer: React.FC<Props> = ({ location: incomingLocation }) => {
  const [search, setSearch] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Synchronize internal search state when a new location is passed from the parent (e.g. clicking MAP from Itinerary)
  useEffect(() => {
    if (incomingLocation) {
      setSearch(incomingLocation);
    }
  }, [incomingLocation]);

  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.debug("Geolocation error or denied:", error);
          setIsLocating(false);
        }
      );
    }
  }, []);

  // Map URL Logic:
  // 1. If user is searching (or search was set by clicking a MAP button), show that result
  // 2. Else if user coordinates are available (permission granted), show current location
  // 3. Else show world map (fallback)
  const getMapUrl = () => {
    if (search.trim()) {
      return `https://www.google.com/maps?q=${encodeURIComponent(search)}&output=embed`;
    }
    if (userCoords) {
      return `https://www.google.com/maps?q=${userCoords.lat},${userCoords.lng}&z=15&output=embed`;
    }
    // Default to a broad world view if no search and no location permission
    return `https://www.google.com/maps?q=world&z=2&output=embed`;
  };

  const getExternalMapUrl = () => {
    if (search.trim()) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search)}`;
    }
    if (userCoords) {
      return `https://www.google.com/maps/search/?api=1&query=${userCoords.lat},${userCoords.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=world`;
  };

  const handleBringMeThere = () => {
    window.open(getExternalMapUrl(), '_blank');
  };

  return (
    <div className="flex flex-col animate-fadeIn px-2 pt-12 pb-8 h-full">
      {/* Title Banner */}
      <div className="text-center mb-8 flex flex-col items-center shrink-0">
        <div className="w-16 h-1 bg-green-200 rounded-full mb-4 opacity-50"></div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-2xl text-green-600">
            <Sparkles size={20} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Find a Place</h1>
          <div className="p-2 bg-green-100 rounded-2xl text-green-600">
            <MapPin size={20} />
          </div>
        </div>
        <p className="text-[10px] text-green-600 mt-2 uppercase font-black tracking-[0.2em] opacity-60">Discover your next adventure</p>
      </div>

      <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="bg-green-50/50 p-2 rounded-[2rem] border-2 border-green-100 shadow-sm flex items-center gap-2 px-5 focus-within:border-green-300 focus-within:bg-white transition-all shrink-0">
          <Search size={20} className="text-green-500" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a location..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3.5 font-bold text-green-800 placeholder:text-green-200"
          />
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-[3rem] overflow-hidden border-4 border-white shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex-1 relative transform hover:scale-[1.005] transition-transform">
          <iframe
            title="Google Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={getMapUrl()}
          ></iframe>
          
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-green-100 shadow-lg flex items-center gap-2 max-w-[80%]">
            <div className={`w-2 h-2 ${isLocating ? 'bg-yellow-400' : (userCoords || search ? 'bg-green-500' : 'bg-gray-300')} rounded-full ${isLocating ? 'animate-pulse' : ''}`}></div>
            <span className="text-[10px] font-black text-green-700 uppercase tracking-wider truncate">
              {search ? search : (userCoords ? "Your Current Location" : "World View")}
            </span>
          </div>
        </div>

        {/* Navigation Action Button */}
        <div className="px-2 shrink-0 pb-20">
          <button 
            onClick={handleBringMeThere}
            className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[2.5rem] shadow-[0_15px_30px_rgba(22,163,74,0.25)] flex items-center justify-center gap-3 transition-all active:scale-95 group"
          >
            <div className="p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform">
              <Navigation size={20} fill="currentColor" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">LET'S GO EXPLORE! ✨</span>
          </button>
          <p className="text-center text-[9px] text-gray-400 font-bold uppercase mt-4 tracking-tighter italic">
            It will re-direct to Google Maps
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapViewer;
