import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Navigation, Plus, Check, Building2, Search } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { LocationData, Project } from '../types';

interface ProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NIGERIA_CITIES: LocationData[] = [
  {
    address: 'Ring Road Phase 2',
    city: 'Osogbo',
    state: 'Osun',
    country: 'Nigeria',
    latitude: 7.7827,
    longitude: 4.5418,
  },
  {
    address: 'Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    latitude: 6.4474,
    longitude: 3.4723,
  },
  {
    address: 'Central Business District',
    city: 'Abuja',
    state: 'FCT',
    country: 'Nigeria',
    latitude: 9.0765,
    longitude: 7.3986,
  },
  {
    address: 'Bodija Estate',
    city: 'Ibadan',
    state: 'Oyo',
    country: 'Nigeria',
    latitude: 7.3775,
    longitude: 3.947,
  },
  {
    address: 'GRA Phase 2',
    city: 'Port Harcourt',
    state: 'Rivers',
    country: 'Nigeria',
    latitude: 4.8156,
    longitude: 7.0498,
  },
  {
    address: 'Badawa Layout',
    city: 'Kano',
    state: 'Kano',
    country: 'Nigeria',
    latitude: 12.0022,
    longitude: 8.592,
  },
];

export const ProjectSelectorModal: React.FC<ProjectSelectorModalProps> = ({ isOpen, onClose }) => {
  const { projects, activeProject, setActiveProject, createProject } = useProject();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(NIGERIA_CITIES[0]);
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const handleSelectProject = (proj: Project) => {
    setActiveProject(proj);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: LocationData = {
            address: 'GPS Current Site Location',
            city: 'Osogbo', // inferred or reverse geocoded
            state: 'Osun',
            country: 'Nigeria',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setSelectedLocation(loc);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation failed:', err);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    await createProject(projectName.trim(), selectedLocation);
    setProjectName('');
    setIsAddingNew(false);
    onClose();
  };

  const filteredLocations = NIGERIA_CITIES.filter((c) =>
    `${c.city} ${c.state} ${c.address}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#121418] border border-slate-800 p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-amber-500">
            <MapPin className="h-5 w-5" />
            <h3 className="font-['Cabinet_Grotesk'] text-xl font-extrabold text-white">
              WHERE ARE YOU BUILDING?
            </h3>
          </div>

          <p className="text-xs text-slate-400 mb-6">
            Constrora searches resources around your project site, not your phone's current position.
          </p>

          {!isAddingNew ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Your Active Construction Projects
                </div>

                {projects.map((proj) => {
                  const isSelected = activeProject.projectId === proj.projectId;
                  return (
                    <button
                      key={proj.projectId}
                      onClick={() => handleSelectProject(proj)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-amber-500 text-black font-extrabold' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {proj.name}
                            {isSelected && (
                              <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-extrabold">
                                ACTIVE
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            📍 {proj.location.address}, {proj.location.city}, {proj.location.state}
                          </p>
                        </div>
                      </div>

                      {isSelected && <Check className="h-5 w-5 text-amber-500" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-900/50 text-amber-400 font-bold text-xs transition-all cursor-pointer mt-2"
              >
                <Plus className="h-4 w-4" /> ADD NEW PROJECT LOCATION
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateNewProject} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. My Duplex, Commercial Plaza, Warehouse"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Project Location
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Navigation className="h-3 w-3" />
                    {isLocating ? 'Locating...' : 'Use Current GPS'}
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city, area, landmark..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {filteredLocations.map((loc, idx) => {
                    const isLocSelected = selectedLocation.city === loc.city;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedLocation(loc)}
                        className={`p-2.5 text-left rounded-xl border text-xs cursor-pointer transition-all ${
                          isLocSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold">{loc.city}</div>
                        <div className="text-[10px] text-slate-400">{loc.state} State</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 cursor-pointer uppercase tracking-wider"
                >
                  Save & Set Active
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
