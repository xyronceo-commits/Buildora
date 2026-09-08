import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDocs, query, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { LocationData, Project } from '../types';
import { INITIAL_PROJECTS } from '../data/seedData';
import { useAuth } from './AuthContext';

const DEFAULT_SITE: Project = {
  projectId: 'proj_default_site',
  ownerId: 'default_user',
  name: 'Main Site',
  location: {
    address: 'Ring Road Phase 2',
    city: 'Osogbo',
    state: 'Osun',
    country: 'Nigeria',
    latitude: 7.7827,
    longitude: 4.5418,
  },
  isDefault: true,
  savedItemIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface ProjectContextType {
  projects: Project[];
  activeProject: Project;
  setActiveProject: (project: Project) => void;
  createProject: (name: string, location: LocationData) => Promise<Project>;
  updateProjectLocation: (projectId: string, location: LocationData) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  loadingProjects: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('buildora_user_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeProject, setActiveProjectState] = useState<Project>(() => {
    const savedActiveId = localStorage.getItem('buildora_active_project_id');
    if (savedActiveId) {
      const found = projects.find((p) => p.projectId === savedActiveId);
      if (found) return found;
    }
    return projects[0] || DEFAULT_SITE;
  });

  const [loadingProjects, setLoadingProjects] = useState(false);

  // Load user projects from Firestore if authenticated
  useEffect(() => {
    async function loadFirestoreProjects() {
      if (!currentUser) return;
      setLoadingProjects(true);
      try {
        const q = query(collection(db, 'projects'), where('ownerId', '==', currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => d.data() as Project);
          setProjects(loaded);
          const defaultProj = loaded.find((p) => p.isDefault) || loaded[0];
          setActiveProjectState(defaultProj);
          localStorage.setItem('buildora_user_projects', JSON.stringify(loaded));
          localStorage.setItem('buildora_active_project_id', defaultProj.projectId);
        } else {
          setProjects([]);
          localStorage.removeItem('buildora_user_projects');
        }
      } catch (err) {
        console.warn('Could not load projects from Firestore, fallback to local', err);
      } finally {
        setLoadingProjects(false);
      }
    }
    loadFirestoreProjects();
  }, [currentUser]);

  const setActiveProject = (project: Project) => {
    setActiveProjectState(project);
    localStorage.setItem('buildora_active_project_id', project.projectId);
  };

  const createProject = async (name: string, location: LocationData): Promise<Project> => {
    const newProj: Project = {
      projectId: `proj_${Date.now()}`,
      ownerId: currentUser?.uid || 'guest_user',
      name,
      location,
      isDefault: projects.length === 0,
      savedItemIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newProj, ...projects];
    setProjects(updatedList);
    setActiveProject(newProj);
    localStorage.setItem('buildora_user_projects', JSON.stringify(updatedList));

    if (currentUser) {
      try {
        await setDoc(doc(db, 'projects', newProj.projectId), newProj);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `projects/${newProj.projectId}`);
      }
    }

    return newProj;
  };

  const updateProjectLocation = async (projectId: string, location: LocationData) => {
    const updatedProjects = projects.map((p) =>
      p.projectId === projectId ? { ...p, location, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('buildora_user_projects', JSON.stringify(updatedProjects));

    if (activeProject.projectId === projectId) {
      setActiveProjectState({ ...activeProject, location, updatedAt: new Date().toISOString() });
    }

    if (currentUser) {
      try {
        await setDoc(doc(db, 'projects', projectId), { location, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
      }
    }
  };

  const deleteProject = async (projectId: string) => {
    const updatedProjects = projects.filter((p) => p.projectId !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('buildora_user_projects', JSON.stringify(updatedProjects));

    if (activeProject.projectId === projectId) {
      const nextActive = updatedProjects[0] || DEFAULT_SITE;
      setActiveProjectState(nextActive);
      localStorage.setItem('buildora_active_project_id', nextActive.projectId);
    }

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
      } catch (err) {
        console.warn('Could not delete project from Firestore:', err);
      }
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        createProject,
        updateProjectLocation,
        deleteProject,
        loadingProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
};
