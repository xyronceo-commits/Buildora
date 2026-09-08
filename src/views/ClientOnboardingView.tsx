import React, { useState } from 'react';
import { ArrowLeft, HardHat, MapPin, CheckCircle2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

interface ClientOnboardingViewProps {
  onComplete: () => void;
  onBackToRoleSelection: () => void;
}

export const ClientOnboardingView: React.FC<ClientOnboardingViewProps> = ({
  onComplete,
  onBackToRoleSelection,
}) => {
  const { createProject } = useProject();
  const { updateUserProfile } = useAuth();

  const [projectName, setProjectName] = useState('MY DUPLEX');
  const [address, setAddress] = useState('Ring Road Phase 2');
  const [city, setCity] = useState('Osogbo');
  const [state, setState] = useState('Osun');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject(projectName || 'MY SITE', {
      address: address || 'Site Address',
      city: city || 'Osogbo',
      state: state || 'Osun',
      country: 'Nigeria',
      latitude: 7.7827,
      longitude: 4.5418,
    });

    localStorage.setItem('buildora_client_onboarding_completed', 'true');
    await updateUserProfile({
      role: 'client',
      clientOnboardingCompleted: true,
      onboardingCompleted: true,
    });

    onComplete();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-8 px-4 pb-20">
      <button
        onClick={onBackToRoleSelection}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl cursor-pointer uppercase tracking-wider"
      >
        <ArrowLeft className="h-4 w-4" /> Change Role
      </button>

      <div className="rounded-3xl bg-[#121418] border-2 border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl bg-grid-industrial">
        <div className="space-y-2 text-center border-b border-slate-800 pb-5">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center font-black">
            <HardHat className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/30">
            BUILDER PROJECT SETUP
          </span>
          <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            WHERE ARE YOU BUILDING?
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-md mx-auto">
            Constrora prioritizes equipment, materials, and logistics suppliers around your specific project location.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
              PROJECT / SITE NAME
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. My Duplex, Commercial Plaza Phase 1"
              className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold focus:border-amber-500 outline-none"
            />
          </div>

          <div className="space-y-3 pt-1">
            <label className="font-black text-slate-200 block uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-4 w-4 text-amber-500" /> PROJECT LOCATION
            </label>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Site Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Ring Road Phase 2, near Technical College"
                className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">City / Town</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Osogbo"
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Osun"
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" /> START SEARCHING CONSTRORA
          </button>
        </form>
      </div>
    </div>
  );
};
