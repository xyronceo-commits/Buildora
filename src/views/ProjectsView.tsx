import React, { useState } from 'react';
import { Building2, MapPin, Plus, Check, Trash2, HardHat, Compass } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface ProjectsViewProps {
 onOpenProjectModal: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenProjectModal }) => {
 const { projects, activeProject, setActiveProject, deleteProject } = useProject();

 return (
 <div className="space-y-6 pb-20 max-w-4xl mx-auto">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="font-['Cabinet_Grotesk'] text-2xl font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
 <Building2 className="h-6 w-6 text-[#F59E0B]" />
 <span>CONSTRUCTION PROJECTS ({projects.length})</span>
 </h1>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
 Constrora organizes resource discovery around your active project site location.
 </p>
 </div>

 <button
 onClick={onOpenProjectModal}
 className="flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer uppercase tracking-wider"
 >
 <Plus className="h-4 w-4" /> ADD PROJECT
 </button>
 </div>

 {projects.length === 0 ? (
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] p-8 text-center space-y-4 ">
 <div className="mx-auto h-12 w-12 rounded-lg bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#F59E0B] dark:text-[#FBBF24]">
 <Building2 className="h-6 w-6" />
 </div>
 <div className="space-y-1">
 <h3 className="text-base font-bold text-[#111111] dark:text-white">No Construction Projects Added Yet</h3>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
 Add your active building or civil engineering project site to discover materials, equipment, and suppliers in your immediate radius.
 </p>
 </div>
 <button
 onClick={onOpenProjectModal}
 className="px-5 py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider inline-flex items-center gap-2 "
 >
 <Plus className="h-4 w-4" /> Create Your First Project
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {projects.map((proj) => {
 const isActive = activeProject.projectId === proj.projectId;
 return (
 <div
 key={proj.projectId}
 className={`rounded-lg p-5 border transition-all flex flex-col justify-between space-y-4 ${
 isActive
 ? 'bg-white dark:bg-[#18181B] border-[#FBBF24] ring-1 ring-[#FBBF24]/30'
 : 'bg-white dark:bg-[#18181B] border-[#E5E5E5] dark:border-[#27272A]'
 }`}
 >
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div
 className={`h-9 w-9 rounded-xl flex items-center justify-center ${
 isActive ? 'bg-[#FBBF24] text-zinc-950 font-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
 }`}
 >
 <HardHat className="h-5 w-5" />
 </div>
 <div>
 <h3 className="font-bold text-zinc-950 dark:text-white text-base">{proj.name}</h3>
 <p className="text-xs text-amber-600 dark:text-[#FBBF24] font-semibold">📍 {proj.location.city}, {proj.location.state}</p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 {isActive && (
 <span className="text-[10px] bg-[#FBBF24] text-zinc-950 font-black px-2 py-0.5 rounded uppercase">
 ACTIVE SITE
 </span>
 )}
 <button
 onClick={() => deleteProject(proj.projectId)}
 className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
 title="Delete Project"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </div>
 </div>

 <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
 <div>Address: <strong className="text-zinc-950 dark:text-white">{proj.location.address}</strong></div>
 <div>GPS Coordinates: <span className="font-mono text-zinc-700 dark:text-zinc-300">{proj.location.latitude.toFixed(4)}, {proj.location.longitude.toFixed(4)}</span></div>
 </div>
 </div>

 <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
 {!isActive ? (
 <button
 onClick={() => setActiveProject(proj)}
 className="w-full py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] text-zinc-950 dark:text-[#FBBF24] text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[44px]"
 >
 Set as Active Discovery Site
 </button>
 ) : (
 <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 py-2">
 <Check className="h-4 w-4" /> Currently Active Search Site
 </span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
};
