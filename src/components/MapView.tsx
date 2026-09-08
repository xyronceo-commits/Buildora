import React, { useState } from 'react';
import { MapPin, HardHat, Building2, Eye, Wrench, Package, Truck, Compass } from 'lucide-react';
import { Listing, LocationData } from '../types';
import { useProject } from '../context/ProjectContext';
import { formatDistance } from '../utils/distance';

interface MapViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export const MapView: React.FC<MapViewProps> = ({ listings, onSelectListing }) => {
  const { activeProject } = useProject();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(listings[0] || null);

  return (
    <div className="relative w-full h-[550px] rounded-2xl bg-[#0F1115] border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between p-4">
      {/* Map Graphic Canvas / Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F59E0B" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated Roads */}
          <path d="M 0 200 Q 300 150 800 350" fill="none" stroke="#F59E0B" strokeWidth="3" opacity="0.4" />
          <path d="M 400 0 Q 450 300 500 600" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.3" />
        </svg>
      </div>

      {/* Map Top Status Bar */}
      <div className="relative z-10 flex items-center justify-between bg-[#121418]/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Compass className="h-4 w-4 animate-spin-slow" />
          <span>PROJECT LOCATION RADIAL DISCOVERY</span>
        </div>

        <div className="text-slate-300 font-medium">
          📍 {activeProject.name} · {activeProject.location.city} ({listings.length} resources found)
        </div>
      </div>

      {/* Center Project Site Marker */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        {/* Project Target Pin */}
        <div className="relative mb-8 flex flex-col items-center animate-bounce">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-black font-extrabold shadow-xl shadow-amber-500/30 border-2 border-white">
            <HardHat className="h-6 w-6" />
          </div>
          <span className="mt-1 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow uppercase">
            SITE: {activeProject.name}
          </span>
        </div>

        {/* Orbiting Nearby Resources Pins */}
        <div className="w-full max-w-xl grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listings.slice(0, 6).map((item) => {
            const isSelected = selectedListing?.listingId === item.listingId;
            const distanceStr = formatDistance(activeProject.location, item.location);

            return (
              <button
                key={item.listingId}
                onClick={() => setSelectedListing(item)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-amber-500 text-black border-white shadow-xl scale-105 font-bold'
                    : 'bg-[#121418]/90 text-white border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-black text-amber-400' : 'bg-slate-800 text-amber-400'
                  }`}
                >
                  {item.type === 'equipment' ? (
                    <Wrench className="h-4 w-4" />
                  ) : item.type === 'material' ? (
                    <Package className="h-4 w-4" />
                  ) : (
                    <Truck className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{item.title}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-black/80 font-bold' : 'text-slate-400'}`}>
                    📍 {distanceStr}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Listing Bottom Preview Card */}
      {selectedListing && (
        <div className="relative z-10 bg-[#121418] border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={selectedListing.photos[0]}
              alt={selectedListing.title}
              className="h-12 w-12 rounded-xl object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{selectedListing.title}</h4>
              <p className="text-[11px] text-amber-400 font-semibold">
                {selectedListing.rental?.dailyPrice ? `₦${selectedListing.rental.dailyPrice.toLocaleString()}/day` : selectedListing.price ? `₦${selectedListing.price.toLocaleString()}/${selectedListing.priceUnit}` : 'Contact for Price'}
              </p>
              <p className="text-[10px] text-slate-400">
                Supplier: {selectedListing.businessName} · 📍 {formatDistance(activeProject.location, selectedListing.location)}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectListing(selectedListing)}
            className="flex items-center gap-1.5 bg-amber-500 text-black font-extrabold px-3.5 py-2 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer shrink-0"
          >
            <Eye className="h-4 w-4" /> INSPECT
          </button>
        </div>
      )}
    </div>
  );
};
