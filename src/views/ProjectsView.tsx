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
          <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1">
            Constrora organizes resource discovery around your active project site location.
          </p>
        </div>

        <button
          onClick={onOpenProjectModal}
          className="flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" /> ADD PROJECT
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-8 text-center space-y-4 shadow-2xs">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#B45309] dark:text-[#FBBF24]">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#111111] dark:text-white">No Construction Projects Added Yet</h3>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 max-w-sm mx-auto">
              Add your active building or civil engineering project site to discover materials, equipment, and suppliers in your immediate radius.
            </p>
          </div>
          <button
            onClick={onOpenProjectModal}
            className="px-5 py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider inline-flex items-center gap-2 shadow-sm"
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
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-2xs ${
                  isActive
                    ? 'bg-white dark:bg-[#121418] border-[#FBBF24] ring-1 ring-[#FBBF24]/30'
                    : 'bg-white dark:bg-[#121418] border-[#E5E5E5] dark:border-slate-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-[#FBBF24] text-[#111111] font-black' : 'bg-slate-100 dark:bg-slate-800 text-[#6B7280] dark:text-slate-400'
                        }`}
                      >
                        <HardHat className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#111111] dark:text-white text-base">{proj.name}</h3>
                        <p className="text-xs text-[#B45309] dark:text-[#FBBF24] font-semibold">📍 {proj.location.city}, {proj.location.state}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="text-[10px] bg-[#FBBF24] text-[#111111] font-black px-2 py-0.5 rounded uppercase">
                          ACTIVE SITE
                        </span>
                      )}
                      <button
                        onClick={() => deleteProject(proj.projectId)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F7F7F5] dark:bg-slate-900 rounded-xl border border-[#E5E5E5] dark:border-slate-800 text-xs text-[#374151] dark:text-slate-300 space-y-1">
                    <div>Address: <strong className="text-[#111111] dark:text-white">{proj.location.address}</strong></div>
                    <div>GPS Coordinates: <span className="font-mono text-[#6B7280] dark:text-slate-400">{proj.location.latitude.toFixed(4)}, {proj.location.longitude.toFixed(4)}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5] dark:border-slate-800 flex items-center justify-between">
                  {!isActive ? (
                    <button
                      onClick={() => setActiveProject(proj)}
                      className="w-full py-2 bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 hover:border-[#FBBF24] text-[#B45309] dark:text-[#FBBF24] text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Set as Active Discovery Site
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
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
