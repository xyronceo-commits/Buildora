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
    <div className="relative w-full h-[550px] rounded-2xl bg-[#F7F7F5] dark:bg-[#0F1115] border border-[#E5E5E5] dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between p-4">
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
      <div className="relative z-10 flex items-center justify-between bg-white/95 dark:bg-[#121418]/90 backdrop-blur-md p-3 rounded-xl border border-[#E5E5E5] dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-[#B45309] dark:text-[#FBBF24] font-bold">
          <Compass className="h-4 w-4 animate-spin-slow text-[#F59E0B]" />
          <span>PROJECT LOCATION RADIAL DISCOVERY</span>
        </div>

        <div className="text-[#374151] dark:text-slate-300 font-medium">
          📍 {activeProject.name} · {activeProject.location.city} ({listings.length} resources found)
        </div>
      </div>

      {/* Center Project Site Marker */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        {/* Project Target Pin */}
        <div className="relative mb-8 flex flex-col items-center animate-bounce">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBBF24] text-[#111111] font-black shadow-lg border-2 border-white dark:border-slate-900">
            <HardHat className="h-6 w-6" />
          </div>
          <span className="mt-1 bg-[#FBBF24] text-[#111111] text-[10px] font-black px-2 py-0.5 rounded shadow uppercase">
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
                    ? 'bg-[#FBBF24] text-[#111111] border-white dark:border-slate-900 shadow-md scale-105 font-bold'
                    : 'bg-white/95 dark:bg-[#121418]/90 text-[#111111] dark:text-white border-[#E5E5E5] dark:border-slate-800 hover:border-[#FBBF24]'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#111111] text-[#FBBF24]' : 'bg-slate-100 dark:bg-slate-800 text-[#F59E0B]'
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
                  <div className={`text-[10px] ${isSelected ? 'text-[#111111]/80 font-bold' : 'text-[#6B7280] dark:text-slate-400'}`}>
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
        <div className="relative z-10 bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={selectedListing.photos[0]}
              alt={selectedListing.title}
              className="h-12 w-12 rounded-xl object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#111111] dark:text-white truncate">{selectedListing.title}</h4>
              <p className="text-[11px] text-[#B45309] dark:text-[#FBBF24] font-bold">
                {selectedListing.rental?.dailyPrice ? `₦${selectedListing.rental.dailyPrice.toLocaleString()}/day` : selectedListing.price ? `₦${selectedListing.price.toLocaleString()}/${selectedListing.priceUnit}` : 'Contact for Price'}
              </p>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-400">
                Supplier: {selectedListing.businessName} · 📍 {formatDistance(activeProject.location, selectedListing.location)}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectListing(selectedListing)}
            className="flex items-center gap-1.5 bg-[#FBBF24] text-[#111111] font-black px-3.5 py-2 rounded-xl text-xs hover:bg-[#F59E0B] transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <Eye className="h-4 w-4" /> INSPECT
          </button>
        </div>
      )}
    </div>
  );
};
