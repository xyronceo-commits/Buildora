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
 className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-white bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] px-3.5 py-2 rounded-xl cursor-pointer uppercase tracking-wider"
 >
 <ArrowLeft className="h-4 w-4" /> Change Role
 </button>

 <div className="rounded-lg bg-[#18181B] border-2 border-[#E5E5E5] dark:border-[#27272A] p-6 sm:p-8 space-y-6 ">
 <div className="space-y-2 text-center border-b border-[#E5E5E5] dark:border-[#27272A] pb-5">
 <div className="mx-auto h-12 w-12 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center justify-center font-black">
 <HardHat className="h-6 w-6" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-[#FBBF24] bg-[#FBBF24]/10 px-3 py-1 rounded border border-[#FBBF24]/30">
 BUILDER PROJECT SETUP
 </span>
 <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
 WHERE ARE YOU BUILDING?
 </h1>
 <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-md mx-auto">
 Constrora prioritizes equipment, materials, and logistics suppliers around your specific project location.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5 text-xs">
 <div>
 <label className="font-black text-neutral-300 dark:text-white block mb-1 uppercase tracking-wider">
 PROJECT / SITE NAME
 </label>
 <input
 type="text"
 required
 value={projectName}
 onChange={(e) => setProjectName(e.target.value)}
 placeholder="e.g. My Duplex, Commercial Plaza Phase 1"
 className="w-full bg-white dark:bg-[#18181B] border-2 border-[#E5E5E5] dark:border-[#27272A] rounded-xl p-3.5 text-xs text-white font-bold focus:border-[#FBBF24] outline-none"
 />
 </div>

 <div className="space-y-3 pt-1">
 <label className="font-black text-neutral-300 dark:text-white block uppercase tracking-wider flex items-center gap-1">
 <MapPin className="h-4 w-4 text-[#FBBF24]" /> PROJECT LOCATION
 </label>

 <div>
 <label className="text-neutral-500 dark:text-neutral-400 block mb-1 font-bold">Site Street Address</label>
 <input
 type="text"
 required
 value={address}
 onChange={(e) => setAddress(e.target.value)}
 placeholder="e.g. Ring Road Phase 2, near Technical College"
 className="w-full bg-white dark:bg-[#18181B] border-2 border-[#E5E5E5] dark:border-[#27272A] rounded-xl p-3.5 text-xs text-white font-bold focus:border-[#FBBF24] outline-none"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-neutral-500 dark:text-neutral-400 block mb-1 font-bold">City / Town</label>
 <input
 type="text"
 required
 value={city}
 onChange={(e) => setCity(e.target.value)}
 placeholder="e.g. Osogbo"
 className="w-full bg-white dark:bg-[#18181B] border-2 border-[#E5E5E5] dark:border-[#27272A] rounded-xl p-3.5 text-xs text-white font-bold focus:border-[#FBBF24] outline-none"
 />
 </div>
 <div>
 <label className="text-neutral-500 dark:text-neutral-400 block mb-1 font-bold">State</label>
 <input
 type="text"
 required
 value={state}
 onChange={(e) => setState(e.target.value)}
 placeholder="e.g. Osun"
 className="w-full bg-white dark:bg-[#18181B] border-2 border-[#E5E5E5] dark:border-[#27272A] rounded-xl p-3.5 text-xs text-white font-bold focus:border-[#FBBF24] outline-none"
 />
 </div>
 </div>
 </div>

 <button
 type="submit"
 className="w-full bg-[#FBBF24] text-black font-black py-4 rounded-lg text-xs hover:bg-[#F59E0B] transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
 >
 <CheckCircle2 className="h-4 w-4" /> START SEARCHING CONSTRORA
 </button>
 </form>
 </div>
 </div>
 );
};
